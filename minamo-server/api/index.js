'use strict';

const promisifyAll = require('bluebird').promisifyAll
    , express = require('express')
    , multer = require('multer')
    , path = require('path')
    , crypto = require('crypto')
    , crc = require('crc').crc32
    , fs = promisifyAll(require('fs-extra'))
    , tar = require('tar')
    , init = require('git-init')
    , head = require('githead')
    , appReq = require('app-require');

const Docker = require('dockerode')
    , docker = promisifyAll(new Docker());

const config = appReq('./config')
    , userDb = new(appReq('./lib/auth/userdb'))(config.userdb)
    , container = appReq('./lib/container');

const ContainerRegexpString = '[a-z][a-z0-9-]*[a-z0-9]';
const ContainerRegexp = new RegExp(`^${ContainerRegexpString}\$`);

const hmac = (key, data) => {
  return crypto.createHmac('sha1', key).update(data).digest('hex');
};

function checkParams(req, res){
  const name = req.params.service || req.query.service || req.body.service;
  if(!name){
    res.status(400).send('error: no service');
    return {};
  }
  if(!ContainerRegexp.test(name)){
    res.status(400).send(`error: service should be ${ContainerRegexpString}`);
    return {};
  }
  const repo = path.join(config.repo_path, name);
  return {name, repo};
}

function isEnvFile(filename){
  const stat = fs.statSync(path.join(config.repo_path, filename));
  return stat.isFile() && filename.endsWith('.env');
}

class api {
  constructor(kvs, io){
    this.kvs = kvs;
    this.initializeKvs();
    /* public api */
    const pub = express.Router();
    const hooks = require('./hooks')(kvs);
    pub.get('/hooks/:repo', hooks);
    pub.post('/hooks/:repo', hooks);
    pub.get('/verify', this.verifyCredentials);
    /* v2 api */
    const priv = express.Router();
    const svcBase = '/services/:service';
    priv.get(`/services`, this.list);
    priv.get(`/services/status`, this.status.bind(this));
    priv.get('/services/available', this.checkAvailability);
    priv.put(`${svcBase}`, this.create);
    priv.delete(`${svcBase}`, this.destroy.bind(this));
    priv.post(`${svcBase}/start`, this.start.bind(this));
    priv.post(`${svcBase}/stop`, this.stop.bind(this));
    priv.post(`${svcBase}/restart`, this.restart.bind(this));
    priv.get(`${svcBase}/logs`, this.logs);
    priv.get(`${svcBase}/env`, this.env);
    priv.post(`${svcBase}/env/update`, this.updateEnv);
    priv.get('/credentials/connected', this.getConnectedCredentials);
    priv.get('/credentials/:service/connect', this.connectSocialId);
    priv.post('/credentials/:service/disconnect', this.disconnectSocialId);
    priv.post('/credentials/fido/register', this.registerFidoCredentials);
    priv.post('/users/profile/update', this.updateProfile);
    priv.post('/users/avatar/upload', multer({dest: '/tmp/upload/'}).single('file'),
              this.uploadAvatar);
    /* admin api */
    const admin = require('./admin')();
    priv.use(requireAdminRights, admin);
    // io
    require('./io-auth')(io, '/status').on('connection', this.wsStatuses.bind(this));
    require('./logstream.js')(io);
    require('./terminal.js')(io);
    require('./attach.js')(io, async (req) => {
      const name = req.headers['x-minamo-service'];
      if(!name || !ContainerRegexp.test(name)) return false;
      const repo = path.join(config.repo_path, name);
      if(!pathExists(repo)) return false;
      return await container.isRunning(name);
    });
    require('./sysinfo')(io);
    // install
    const app = express.Router();
    app.use(ignoreCaches, pub);
    app.use(ignoreCaches, rejectIfNotAuthenticated, priv);
    return app;
  }

  async initializeKvs(){
    const containers = await docker.listContainersAsync({all: true});
    const files = await fs.readdirAsync(config.repo_path);
    const names = containers.map(x => x.Names[0]);
    const repos = files.filter(x => x[0] !== '.' && !isEnvFile(x))
      .filter(x => names.indexOf('/' + x) >= 0);
    for(let i = 0; i < repos.length; ++i){
      this.kvs.addHost(`${repos[i]}.${config.domain}`);
    }
  }

  async getBranchForRepoAsync(repo){
    const env = path.join(config.repo_path, repo + '.env');
    const json = await fs.readFileAsync(env).catch(() => '{}');
    const vars = JSON.parse(json);
    return vars['MINAMO_BRANCH_NAME'] || 'master';
  }

  async getContainerStatusesAsync(){
    const containers = await docker.listContainersAsync({all: true});
    const files = await fs.readdirAsync(config.repo_path);
    const statuses = {};
    for(let i = 0; i < files.length; ++i){
      if(files[i][0] === '.') continue;
      const stat = await fs.statAsync(path.join(config.repo_path, files[i]));
      if(stat.isFile() && files[i].endsWith('.env')) continue;
      const branch = await this.getBranchForRepoAsync(files[i]);
      statuses[files[i]] = {
        'status': 'stopped',
        'uptime': '',
        'created': '',
        'head': head(path.join(config.repo_path, files[i]), branch),
        'repo': 'local'
      };
      if(stat.isFile()){
        statuses[files[i]].repo = 'external';
        statuses[files[i]].key = hmac(config.secret || 'minamo.cloud', files[i]);
      }
      for(let j = 0; j < containers.length; ++j){
        if(!containers[j] || !containers[j].Names) continue;
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
      }catch(e){ /* ignore */ }
      try{
        await fs.statAsync('/tmp/minamo/' + files[i] + '.term');
        statuses[files[i]].status = 'stopping';
      }catch(e){ /* ignore */ }
    }
    return statuses;
  }

  verifyCredentials(req, res){
    res.send({isAuthenticated: req.isAuthenticated() ? 1 : 0});
  }

  checkAvailability(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    res.send({available: !pathExists(repo)});
  }

  async create(req, res){
    const { name, repo } = checkParams(req, res);
    const template = req.body.template || '';
    const external = req.body.external || '';
    if(!name) return;
    if(pathExists(repo)){
      res.status(400).send('error: service already exists');
      return;
    }
    const root = path.dirname(require.main.filename);
    const templatePath = path.join(root, '/data/templates/' + template + '.tar.gz');
    const initFunc = function(templ, cb){
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
      const rand = Math.floor(Math.random() * 65535);
      const tmpl = '/tmp/minamo-' + rand + '/';
      await fs.mkdirAsync(tmpl);
      await tar.extract({file: templatePath, cwd: tmpl});
      initFunc(tmpl, () => fs.remove(tmpl));
    }
  }

  async destroy(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      this.kvs.delHost(`${name}.${config.domain}`);
      container.terminate(name, true);
      await fs.removeAsync(repo);
      await fs.removeAsync(repo + '.env');
      res.send('destroy OK');
    }
  }

  async start(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      await container.build(name);
      this.kvs.resetHost(`${name}.${config.domain}`);
      await container.removeStaging(name);
      res.send('start OK');
    }
  }

  stop(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      this.kvs.delHost(`${name}.${config.domain}`);
      container.terminate(name);
      res.send('stop OK');
    }
  }

  async restart(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      if(req.query.quick !== undefined || req.body.quick !== undefined){
        container.restart(name);
      }else{
        await container.build(name);
        await container.removeStaging(name);
      }
      this.kvs.resetHost(`${name}.${config.domain}`);
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
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      fs.readFile(repo + '.env', (err, data) => res.send(data));
    }
  }

  updateEnv(req, res){
    const { name, repo } = checkParams(req, res);
    if(!name) return;
    if(!pathExists(repo)){
      res.status(404).send('error: service not found');
    }else{
      const env = JSON.parse(req.body.env);
      fs.outputJson(repo + '.env', env, () => res.send('OK'));
    }
  }

  logs(req, res){
    const { name } = checkParams(req, res);
    if(!name) return;
    const process = require('child_process').spawn('docker', ['logs', name]);
    process.stdout.pipe(res);
    process.stderr.pipe(res);
  }

  async getConnectedCredentials(req, res){
    const ids = await userDb.getConnectedSocialIds(req.user.username);
    res.send({
      github: !!ids.github
    });
  }

  async connectSocialId(req, res){
    const service = req.params.service;
    if(service !== 'github'){
      return res.send(400);
    }
    const uri = config.proto + '://' + config.domain
              + '/auth/' + service
              + '?_mode=connect&_redir=/console#tab-configure';
    res.redirect(uri);
  }

  async disconnectSocialId(req, res){
    const username = req.user.username;
    const service = req.params.service;
    const ids = await userDb.getConnectedSocialIds(username);
    if(ids[service] === undefined) return res.send(400);
    await userDb.removeSocialId(username, service, ids[service]);
    res.send(200);
  }

  async updateProfile(req, res){
    if(!req.user.username) return res.send(400);
    if(!req.body.password && !req.body.avatar) return res.send(400);
    if(req.body.password){
      await userDb.updateCredential(req.user.username, null, req.body.password);
    }
    if(req.body.avatar){
      const fileName = String(Date.now()) + req.user.username;
      const avatarDir = path.join(config.data_dir, 'avatar');
      const avatarPath = path.join(avatarDir, fileName);
      const uploadPath = path.join('/tmp/upload', path.basename(req.body.avatar));
      if(await fs.statAsync(uploadPath).catch(()=>{})){
        await fs.mkdirAsync(avatarDir).catch(()=>{});
        const read = fs.createReadStream(uploadPath);
        const write = fs.createWriteStream(avatarPath);
        read.pipe(write);
        await userDb.updateAvatar(req.user.username, path.join('/avatar', fileName));
      }
    }
    res.send('OK');
  }

  async registerFidoCredentials(req, res){
    const id = req.body.id;
    const key = JSON.parse(req.body.result);
    try{
      await userDb.addPublicKey(req.user.username, key, id);
      res.sendStatus(200);
    }catch(e){
      res.sendStatus(500);
    }
  }

  async uploadAvatar(req, res){
    res.send(req.file.filename);
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
}

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

function requireAdminRights(req, res, next){
  if(req.user.role === 'admin') { return next(); }
  res.status(404).send();
}

function ignoreCaches(req, res, next){
  res.set('Cache-Control', 'no-store');
  next();
}

module.exports = api;
