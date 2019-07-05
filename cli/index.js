#!/usr/bin/env node

'use strict';

const util = require('util')
    , fs = require('fs')
    , path = require('path')
    , request = util.promisify(require('request'))
    , read = util.promisify(require('read'))
    , columns = require('cli-columns')
    , Table = require('easy-table')
    , SocketIo = require('socket.io-client')

// --
function cachePath(){
  if(process.env.MM_CACHE_PATH){
    return path.join(process.env.MM_CACHE_PATH, '.mm');
  }
  return path.join(process.env.HOME, '.mm');
}
function token(){
  return new Promise(done => {
    if(process.env.MM_AUTH_TOKEN){
      return done(process.env.MM_AUTH_TOKEN);
    }
    const cached = path.join(cachePath(), 'cookie');
    fs.readFile(cached, 'utf-8', (err, content) => {
      if(err){
        console.log('User not logged in');
        process.exit();
      }
      done(content);
    });
  }).then(cookie => {
    return request.cookie(`connect.sid=${cookie}`);
  });
}
function loadConfig(){
  return new Promise(done => {
    const cfg = path.join(cachePath(), 'config');
    fs.readFile(cfg, 'utf-8', (err, content) => {
      if(err){
        return done({});
      }
      done(JSON.parse(content));
    });
  });
}
function saveConfig(cfg){
  const confDir = cachePath()
      , confPath = path.join(confDir, 'config');
  return util.promisify(fs.mkdir)(confDir)
    .catch(()=>{})
    .then(_ => new Promise(done => {
      fs.writeFile(confPath, JSON.stringify(cfg), 'utf-8', (err, content) => done());
    }));
}
function remoteHost(){
  return new Promise(done => {
    if(process.env.MM_REMOTE_HOST){
      return done(process.env.MM_REMOTE_HOST);
    }
    return loadConfig().then(c => {
      if(!c.remoteHost){
        console.log('Remote host is not configured.');
        process.exit();
      }
      done(c.remoteHost);
    });
  });
}
function req(method, path, qs, form){
  return Promise.all([token(), remoteHost()]).then(cfg => {
    const j = request.jar();
    j.setCookie(cfg[0], cfg[1]);
    return request({
      method, form, qs,
      uri: `${cfg[1]}${path}`,
      jar: j,
    });
  });
}
function get(path, args){
  return req('GET', path, args);
}
function post(path, args){
  return req('POST', path, undefined, args);
}
function put(path, args){
  return req('PUT', path, undefined, args);
}
function del(path, args){
  return req('DELETE', path, args);
}
async function ws(path, extraHeaders){
  const cookie = await token();
  const host = await remoteHost();
  const defaultHeaders = {
    Cookie: cookie,
  };
  const socket = SocketIo(`${host}${path}`, {
    autoConnect: false,
    reconnection: false,
    extraHeaders: Object.assign(defaultHeaders, extraHeaders || {})
  });
  socket.on('exit', () => process.exit());
  socket.on('disconnect', () => {
    console.log('disconnect');
    process.exit();
  });
  socket.on('connect_error', () => {
    console.log('connect_error');
    process.exit();
  });
  socket.on('error', () => {
    console.log('socket error');
    process.exit();
  });
  return socket;
}

// --
async function login(){
  const username = await read({prompt: 'Username: '});
  const password = await read({prompt: 'Password: ', silent: true});
  const host = await remoteHost();
  const resp = await request({
    method: 'POST',
    uri: `${host}/auth/local?_redir=%2Foob`,
    form: {username, password}
  });
  if(resp.headers.location === '/oob'){
    const mkdir = util.promisify(fs.mkdir)
        , writeFile = util.promisify(fs.writeFile)
        , confDir = cachePath();
    const sid = resp.headers['set-cookie'][0].split(';').map(x => x.trim().split('='))
      .reduce((p,c)=>((p[c[0]]=c[1]),p),{})['connect.sid'];
    await mkdir(confDir).catch(()=>{});
    await writeFile(path.join(confDir, 'cookie'), sid);
    console.log('Login success');
  }else{
    console.log('Login failed');
  }
}
async function list(){
  const resp = await get('/api/services');
  if(resp.statusCode !== 200){
    console.log(`error: ${resp.statusCode}`);
    return;
  }
  const services = JSON.parse(resp.body);
  console.log(columns(services));
}
async function status(name){
  const resp = await get('/api/services/status', {name});
  if(resp.statusCode === 200){
    const statuses = JSON.parse(resp.body);
    const keys = Object.keys(statuses);
    const table = new Table();
    keys.forEach(x => {
      table.cell('name', x);
      table.cell('status', statuses[x].status);
      table.cell('head', statuses[x].repo === 'local' ? statuses[x].head : 'external');
      table.cell('created', (new Date(statuses[x].created)).toLocaleString());
      table.cell('uptime', statuses[x].uptime);
      table.newRow();
    })
    console.log(table.toString());
  }else{
    console.log(`error: ${resp.statusCode}`);
  }
}
async function create(...args){
  let service, template = null, external = null;
  for(let i = 0; i < args.length; ++i){
    if(args[i] === '--template'){
      template = args[++i];
      continue;
    }
    if(args[i] === '--external'){
      external = args[++i];
      continue;
    }
    service = args[i];
    break;
  }
  if(!service || template === undefined || external === undefined){
    console.log('usage: mm create [--template <template>] [--external <external>] <name>');
    return;
  }
  const available = await get('/api/services/available', {service});
  if(available.statusCode !== 200){
    console.log('error: API error');
    return;
  }
  if(JSON.parse(available.body).available){
    const created = await put(`/api/services/${service}`, {template, external});
    if(created.statusCode === 200){
      console.log(`service ${service} has been created`);
    }else{
      console.log(`error: ${created.statusCode}`);
    }
  }else{
    console.log('error: already exists');
  }
}
async function destroy(name){
  if(!name){
    console.log('usage: mm destroy <name>');
    return;
  }
  const destroyed = await del(`/api/services/${name}`);
  if(destroyed.statusCode === 200){
    console.log(`service ${name} has been deleted`);
  }else{
    console.log(`error: ${destroyed.statusCode}`);
  }
}
async function start(...names){
  if(!names || !names.length){
    console.log('usage: mm start <name>');
    return;
  }
  for(let i = 0; i < names.length; ++i){
    const name = names[i];
    const started = await post(`/api/services/${name}/start`);
    if(started.statusCode === 200){
      console.log(`service ${name} started`);
    }else{
      console.log(`error: ${resp.statusCode}`);
    }
  }
}
async function stop(...names){
  if(!names || !names.length){
    console.log('usage: mm stop <name>');
    return;
  }
  for(let i = 0; i < names.length; ++i){
    const name = names[i];
    const stopped = await post(`/api/services/${name}/stop`);
    if(stopped.statusCode === 200){
      console.log(`service ${name} stopped`);
    }else{
      console.log(`error: ${resp.statusCode}`);
    }
  }
}
async function restart(...args){
  let quick, names = [];
  for(let i = 0; i < args.length; ++i){
    if(args[i] === '-q' || args[i] === '--quick'){
      quick = 1;
      continue;
    }
    names.push(args[i]);
  }
  if(!names.length){
    console.log('usage: mm restart [-q | --quick] <name>');
    return;
  }
  for(let i = 0; i < names.length; ++i){
    const name = names[i];
    const restarted = await post(`/api/services/${name}/restart`, {quick});
    if(restarted.statusCode === 200){
      console.log(`service ${name} restarted`);
    }else{
      console.log(`error: ${resp.statusCode}`);
    }
  }
}
async function logs(...args){
  let follow, name;
  for(let i = 0; i < args.length; ++i){
    if(args[i] == '-f'){
      follow = 1;
      continue;
    }
    name = args[i];
  }
  if(!name){
    console.log('usage: mm logs [-f] <name>');
    return;
  }
  if(follow){
    // connect
    const socket = await ws('/services/logs', {'X-MINAMO-SERVICE': name});
    socket.on('data', d => process.stdout.write(d));
    // initialize session
    socket.open();
  }else{
    const resp = await get(`/api/services/${name}/logs`);
    if(resp.statusCode === 200){
      console.log(resp.body);
    }else{
      console.log(`error: ${resp.statusCode}`);
    }
  }
}
async function env(...args){
  const cmd = args.shift();
  const name = args.shift();
  if(!name || (cmd !== 'list' && cmd !== 'add' && cmd !== 'delete')){
    console.log('usage: mm env list <name>\n'
              + '              add <name> <key> <value>\n'
              + '              del <name> <key>');
    return;
  }
  const list = await get(`/api/services/${name}/env`);
  if(list.statusCode !== 200){
    console.log(`error: ${resp.statusCode}`);
    return;
  }
  if(cmd === 'list'){
    console.log(list.body);
    return;
  }
  const current = JSON.parse(list.body);
  const key = args.shift();
  if(cmd === 'add'){
    const value = args.shift();
    if(!key || value === undefined){
      console.log('usage: mm env add <name> <key> <value>');
      return;
    }
    current[key] = value;
  }else if(cmd === 'del'){
    if(!key){
      console.log('usage: mm env del <name> <key>');
      return;
    }
    delete current[key];
  }
  const updated = await post(`/api/services/${name}/env/update`, {env: JSON.stringify(current)});
  if(updated.statusCode === 200){
    console.log('updated');
  }else{
    console.log(`error: ${resp.statusCode}`);
  }
}
async function attach(name){
  if(!name){
    console.log('usage: mm attach <name>');
    return;
  }
  // check tty
  if(!process.stdout.isTTY || !process.stdin.isTTY){
    console.log('Error: STDIN and STDOUT must be TTY');
    return;
  }
  // connect
  const socket = await ws('/attach', {'X-MINAMO-SERVICE': name});
  socket.on('connect', () => process.stdin.setRawMode(true));
  socket.on('data', d => process.stdout.write(d));
  process.stdin.on('data', d => socket.emit('data', d));
  process.stdin.on('resize', () => {
    socket.emit('resize', [process.stdout.columns, process.stdout.rows]);
  });
  // initialize session
  socket.open();
  socket.emit('resize', [process.stdout.columns, process.stdout.rows]);
}
async function logstream(){
  // check tty
  if(!process.stdout.isTTY){
    console.log('Error: STDOUT must be TTY');
    return;
  }
  // connect
  const socket = await ws('/log');
  socket.on('data', d => process.stdout.write(d));
  // initialize session
  socket.open();
}
async function config(key, value){
  const cfg = await loadConfig();
  if(!key){
    console.log(cfg);
  }else{
    if(value){
      cfg[key] = value;
    }else{
      delete cfg[key];
    }
    await saveConfig(cfg);
  }
}
function help(){
  console.log('usage: mm <command>');
  console.log('<command> = login | list | status | create | destroy |');
  console.log('            start | stop | restart | logs | env | attach |');
  console.log('            logstream');
}

// ---
const args = process.argv.slice(2);
const cmd = args.shift();
switch(cmd){
  case 'login':
  case 'list':
  case 'status':
  case 'create':
  case 'destroy':
  case 'start':
  case 'stop':
  case 'restart':
  case 'logs':
  case 'env':
  case 'attach':
  case 'logstream':
  case 'config':
    eval(cmd).apply(this, args);
    break;
  default:
    help();
    break;
}
