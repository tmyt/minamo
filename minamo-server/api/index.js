'use strict';

const path = require('path')
    , crypto = require('crypto')
    , fs = require('fs-extra')
    , tarball = require('tarball-extract')
    , init = require('git-init')
    , head = require('githead')
    , appReq = require('app-require')
    , shellescape = require('shell-escape');

const Docker = require('dockerode')
    , docker = new Docker({socketPath: '/var/run/docker.sock'});

const config = appReq('./config')
    , tools = appReq('./lib/tools');

const hmac = (key, data) => {
  return crypto.createHmac('sha1', key).update(data).digest('hex');
};

function checkParams(req, res){
  let name = req.query.service || req.body.service;
  if(!name){
    res.send('error: no service');
    return;
  }
  if(!name.match(/^[a-z0-9-]+$/)){
    res.send('error: service should be [a-z0-9-]+');
    return;
  }
  return name;
}

function isEnvFile(filename){
  let stat = fs.statSync(path.join(config.repo_path, filename));
  return stat.isFile() && filename.endsWith('.env');
}

class api {
  constructor(app, kvs){
    this.kvs = kvs;
    this.initializeKvs();
    app.get('/create', this.create);
    app.get('/destroy', this.destroy.bind(this));
    app.get('/start', this.start.bind(this));
    app.get('/stop', this.stop.bind(this));
    app.get('/restart', this.restart.bind(this));
    app.get('/list', this.list);
    app.get('/status', this.status);
    app.get('/logs', this.logs);
    app.get('/env', this.env);
    app.post('/env/update', this.updateEnv);
    app.post('/credentials/update', this.updateCredentials);
    return app;
  }

  initializeKvs(){
    docker.listContainers({all: true}, (err, containers) => {
      fs.readdir(config.repo_path, (err, files) => {
        let names = containers.map(x => x.Names[0]);
        let repos = files.filter(x => x[0] !== '.' && !isEnvFile(x))
          .filter(x => names.indexOf('/' + x) >= 0);
        for(let i = 0; i < repos.length; ++i){
          this.kvs.addHost(`${repos[i]}.${config.domain}`);
        }
      });
    });
  }

  create(req, res){
    let name = checkParams(req, res);
    let template = req.query.template || '';
    let external = req.query.external || '';
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(pathExists(repo)){
      res.send('error: service already exists');
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
      tarball.extractTarball(templatePath, tmpl, err => {
        initFunc(tmpl, () => fs.removeSync(tmpl));
      });
    }
  }

  destroy(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.send('error: service not found');
    }else{
      this.kvs.delHost(`${name}.${config.domain}`);
      tools.terminate(name, true);
      fs.remove(repo, () => fs.remove(repo + '.env', () => res.send('destroy OK')));
    }
  }

  start(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.send('error: service not found');
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
      res.send('error: service not found');
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
      res.send('error: service not found');
    }else{
      this.kvs.resetHost(`${name}.${config.domain}`);
      tools.build(name);
      res.send('restart OK');
    }
  }

  list(req, res){
    fs.readdir(config.repo_path, (err, files) => res.send(files));
  }

  status(req, res){
    docker.listContainers({all: true}, (err, containers) => {
      let statuses = {};
      fs.readdir(config.repo_path, (err, files) => {
        for(let i = 0; i < files.length; ++i){
          if(files[i][0] === '.') continue;
          let stat = fs.statSync(path.join(config.repo_path, files[i]));
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
              statuses[files[i]].status = 'running';
              statuses[files[i]].uptime = containers[j].Status;
              statuses[files[i]].created = containers[j].Created;
              break;
            }
          }
          try{
            fs.statSync('/tmp/minamo/' + files[i] + '.prep');
            statuses[files[i]].status = 'prepareing';
          }catch(e){ }
          try{
            fs.statSync('/tmp/minamo/' + files[i] + '.term');
            statuses[files[i]].status = 'stopping';
          }catch(e){ }
        }
        res.send(statuses);
      });
    });
  }

  env(req, res){
    let name = checkParams(req, res);
    if(!name) return;
    // .git is no required. its seems library bug.
    let repo = path.join(config.repo_path, name);
    if(!pathExists(repo)){
      res.send('error: service not found');
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
      res.send('error: service not found');
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
};

function pathExists(name){
  try{
    fs.statSync(name);
  }catch(e){
    return false;
  }
  return true;
}

module.exports = api;
