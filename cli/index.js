#!/usr/bin/env node

'use strict';

const util = require('util')
    , request = util.promisify(require('request'))
    , columns = require('cli-columns')
    , Table = require('easy-table')
    , SocketIo = require('socket.io-client')

const scheme = 'https:'
    , host = 'minamo.io';

// --
function req(method, path, qs, form){
  const j = request.jar();
  const cookie = request.cookie(`connect.sid=${process.env.MM_AUTH_TOKEN}`);
  j.setCookie(cookie, `${scheme}//${host}`);
  return request({
    method, form, qs,
    uri: `${scheme}//${host}${path}`,
    jar: j,
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

// --
function login(){
}
async function list(){
  const resp = await get('/api/services');
  if(resp.statusCode !== 200){
    console.log('error');
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
    console.log('error');
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
      console.log('error;');
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
      console.log('error;');
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
      console.log('error;');
    }
  }
}
async function logs(name){
  if(!name){
    console.log('usage: mm logs <name>');
    return;
  }
  const resp = await get(`/api/services/${name}/logs`);
  if(resp.statusCode === 200){
    console.log(resp.body);
  }else{
    console.log('error;');
  }
}
async function env(...args){
  const cmd = args.shift();
  const name = args.shift();
  if(!name || (cmd !== 'list' && cmd !== 'add' && cmd !== 'delete')){
    console.log('usage: mm env [list | add | del] <name>');
    return;
  }
  const list = await get(`/api/services/${name}/env`);
  if(list.statusCode !== 200){
    console.log('error:');
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
  }else if(cmd === 'delete'){
    if(!key){
      console.log('usage: mm env delete <name> <key>');
      return;
    }
    delete current[key];
  }
  const updated = await post(`/api/services/${name}/env/update`, {env: JSON.stringify(current)});
  if(updated.statusCode === 200){
    console.log('updated');
  }else{
    console.log('error');
  }
}
function attach(name){
  if(!name){
    console.log('usage: mm attach <name>');
    return;
  }
  // check tty
  if(!process.stdout.isTTY || !process.stdin.isTTY){
    console.log('Error: STDIN and STDOUT must be TTY');
    return;
  }
  process.stdin.setRawMode(true);
  // connect
  const socket = SocketIo(`${scheme}//${host}/attach`, {
    autoConnect: false,
    reconnection: false,
    extraHeaders: {
      Cookie: `connect.sid=${process.env.MM_AUTH_TOKEN}`,
      'X-MINAMO-SERVICE': name,
    }
  });
  socket.on('data', d => process.stdout.write(d));
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
  process.stdin.on('data', d => socket.emit('data', d));
  process.stdin.on('resize', () =>
    socket.emit('resize', [process.stdout.columns, process.stdout.rows]));
  // initialize session
  socket.open();
  socket.emit('resize', [process.stdout.columns, process.stdout.rows]);
}
function help(){
  console.log('usage: mm <command>');
  console.log('<command> = login | list | status | create | destroy |');
  console.log('            start | stop | restart | logs | env | attach');
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
    eval(cmd).apply(this, args);
    break;
  default:
    help();
    break;
}
