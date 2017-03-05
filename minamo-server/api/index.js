'use strict';

const promisifyAll = require('bluebird').promisifyAll
    , express = require('express')
    , path = require('path')
    , crypto = require('crypto')
    , crc = require('crc').crc32
    , fs = promisifyAll(require('fs-extra'))
    , tarball = promisifyAll(require('tarball-extract'))
    , init = require('git-init')
    , head = require('githead')
    , appReq = require('app-require')
    , shellescape = require('shell-escape')

const Docker = require('dockerode')
    , docker = promisifyAll(new Docker());

const config = appReq('./config')
    , tools = appReq('./lib/tools');

const ContainerRegexpString = '[a-z][a-z0-9-]*[a-z0-9]';
const ContainerRegexp = new RegExp(`^${ContainerRegexpString}\$`);

const hmac = (key, data) => {
  return crypto.createHmac('sha1', key).update(data).digest('hex');
};
const hash = (data) => {
  return crypto.createHash('sha1').update(data).digest('hex');
};

function checkParams(req, res){
  let name = req.params.service || req.query.service || req.body.service;
  if(!name){
    res.status(400).send('error: no service');
    return;
  }
  if(!ContainerRegexp.test(name)){
    res.status(400).send(`error: service should be ${ContainerRegexpString}`);
    return;
  }
  return name;
}

function isEnvFile(filename){
  let stat = fs.statSync(path.join(config.repo_path, filename));
  return stat.isFile() && filename.endsWith('.env');
}

class api {
  constructor(app, kvs, io){
    this.kvs = kvs;
    this.initializeKvs();
    /* public api */
    const pub = express.Router();
    const hooks = require('./hooks')(kvs);
    pub.get('/hooks/:repo', hooks);
    pub.post('/hooks/:repo', hooks);
    pub.get('/verify', this.verifyCredentials);
    pub.get('/services/available', this.checkAvailability);
    /* v2 api */
    const priv = express.Router();
    const svcBase = '/services/:service';
    priv.get(`/services`, this.list);
    priv.get(`/services/status`, this.status.bind(this));
    priv.put(`${svcBase}`, this.create);
    priv.delete(`${svcBase}`, this.destroy.bind(this));
    priv.post(`${svcBase}/start`, this.start.bind(this));
    priv.post(`${svcBase}/stop`, this.stop.bind(this));
    priv.post(`${svcBase}/restart`, this.restart.bind(this));
    priv.get(`${svcBase}/logs`, this.logs);
    priv.get(`${svcBase}/env`, this.env);
    priv.post(`${svcBase}/env/update`, this.updateEnv);
    priv.post('/credentials/update', this.updateCredentials);
    priv.post('/credentials/fido/register', this.registerFidoCredentials);
    // io
    io.of('/status').on('connection', this.wsStatuses.bind(this));
    require('./logstream.js')(io);
    require('./terminal.js')(io);
    // install
    app.use(ignoreCaches, pub);
    app.use(ignoreCaches, rejectIfNotAuthenticated, priv);
    return app;
  }

  async initializeKvs(){
    const containers = await docker.listContainersAsync({all: true});
    const files = await fs.readdirAsync(config.repo_path);
    let names = containers.map(x => x.Names[0]);
    let repos = files.filter(x => x[0] !== '.' && !isEnvFile(x))
      .filter(x => names.indexOf('/' + x) >= 0);
    for(let i = 0; i < repos.length; ++i){
      this.kvs.addHost(`${repos[i]}.${config.domain}`);
    }
  }

  async getContainerStatusesAsync(){
    const containers = await docker.listContainersAsync({all: true});
    const files = await fs.readdirAsync(config.repo_path);
    let statuses = {};
    for(let i = 0; i < files.length; ++i){
      if(files[i][0] === '.') continue;
      const stat = await fs.statAsync(path.join(config.repo_path, files[i]));
      if(stat.isFile() && files[i].endsWith('.env')) continue;
      statuses[files[i]] = {
        'status': 'stopped',
        'uptime': '',
        'created': '',
        'head': head(path.join(config.repo_path, files[i])),
        'repo': 'local'
      };
      if(stat.isFile()){
        statuses[files[i]].repo = 'external';
        statuses[files[i]].key = hmac(config.secret || 'minamo.io', files[i]);
      }
      for(let j = 0; j < containers.length; ++j){
        if(containers[j].Names[0] === ('/' + files[i])){
          statuses[files[i]].status = containers[j].State;
          statuses[files[i]].uptime = containers[j].Status;
          statuses[files[i]].created = containers[j].Created * 1000;
          break;
        }
      }
      try{
        await fs.statAsync('/tmp/minamo/' + files[i] + '.prep');
        statuses[files[i]].status = 'prepareing';
      }catch(e){ }
      try{
        await fs.statAsync('/tmp/minamo/' + files[i] + '.term');
        statuses[files[i]].status = 'stopping';
      }catch(e){ }
    }
    return statuses;
  }

  verifyCredentials(req, res){
    res.send({isAuthenticated: req.isAuthenticated() ? 1 : 0});
  }

  checkAvailability(req, res){
    const name = checkParams(req, res);
    if(!name) return;
    res.send({available: !pathExists(path.join(config.repo_path, name))});
  }

  async create(req, res){
    let name = checkParams(req, res);
    let template = req.body.template || '';
    let external = req.body.external || '';
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(pathExists(repo)){
      res.status(400).send('error: service already exists');
      return;
    }
    let root = path.dirname(require.main.filename);
    let templatePath = path.join(root, '/lib/templates/' + template + '.tar.gz');
    let initFunc = function(templ, cb){
      init(repo, true, templ, err => {
        if(cb) cb();
        res.send('create OK: ' + err);
      });
    };
    fs.outputJsonSync(repo + '.env', {});
    if(external !== ''){
      fs.writeFile(repo, external, err => res.send('create OK: ' + err));
    }else if(template === ''){
      initFunc('');
    }else{
      let rand = Math.floor(Math.random() * 65535);
      let tmpl = '/tmp/minamo-' + rand + '/';
      await tarball.extractTarballAsync(templatePath, tmpl);
      initFunc(tmpl, () => fs.remove(tmpl));
    }
  }

  async destroy(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      this.kvs.delHost(`${name}.${config.domain}`);
      tools.terminate(name, true);
      await fs.removeAsync(repo);
      await fs.removeAsync(repo + '.env');
      res.send('destroy OK');
    }
  }

  start(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      this.kvs.resetHost(`${name}.${config.domain}`);
      tools.build(name);
      res.send('start OK');
    }
  }

  stop(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      this.kvs.delHost(`${name}.${config.domain}`);
      tools.terminate(name);
      res.send('stop OK');
    }
  }

  restart(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      if(req.query.quick !== undefined){
        tools.restart(name);
      }else{
        this.kvs.resetHost(`${name}.${config.domain}`);
        tools.build(name);
      }
      res.send('restart OK');
    }
  }

  async list(req, res){
    const files = await fs.readdirAsync(config.repo_path);
    res.send(files.filter(s => s[0] != '.' && !s.endsWith('.env')));
  }

  async status(req, res){
    res.send(await this.getContainerStatusesAsync());
  }

  env(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      fs.readFile(repo + '.env', (err, data) => res.send(data));
    }
  }

  updateEnv(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      let env = JSON.parse(req.body.env);
      fs.outputJson(repo + '.env', env, () => res.send('OK'));
    }
  }

  logs(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // read docker logs
    let process = require('child_process').spawn('docker', ['logs', name]);
    process.stdout.pipe(res);
    process.stderr.pipe(res);
  }

  updateCredentials(req, res){
    let usersPath = path.join(__dirname, '../data/gitusers.json');
    if(!req.user.username || !req.body.password ||
      req.user.username === '' || req.body.password === '') return res.send(400);
    let data = fs.readJsonSync(usersPath);
    data[req.user.username] = req.body.password;
    fs.outputJsonSync(usersPath, data);
    res.send('OK');
  }

  async registerFidoCredentials(req, res){
    const id = req.body.id;
    const value = {
      key: JSON.parse(req.body.key),
      profile: req.user
    };
    const file = path.join(__dirname, `../data/fido2/${hash(id)}.json`);
    try{
      await fs.writeJsonAsync(file, value);
      res.sendStatus(200);
    }catch(e){
      res.sendStatus(500);
    }
  }

  wsStatuses(socket){
    let cookie = undefined;
    const generateAsync = (async function(force){
      const statuses = await this.getContainerStatusesAsync();
      const local = crc(JSON.stringify(statuses)).toString(16);
      if(!force && local === cookie) return null;
      return {statuses, cookie: cookie = local};
    }).bind(this);
    const sendStatuses = (async function(lCookie){
      const state = await generateAsync(lCookie !== undefined);
      if(!state || state.cookie === lCookie) return;
      socket.emit('statuses', state);
    });
    const iid = setInterval(sendStatuses, 5 * 1000);
    socket.on('fetch', sendStatuses);
    socket.on('disconnect', () => clearInterval(iid));
    sendStatuses();
  }
};

function pathExists(name){
  try{
    fs.statSync(name);
  }catch(e){
    return false;
  }
  return true;
}

function rejectIfNotAuthenticated(req, res, next){
  if(req.isAuthenticated()) { return next(); }
  res.status(401).send();
}

function ignoreCaches(req, res, next){
  res.set('Cache-Control', 'no-store');
  next();
}

module.exports = api;
