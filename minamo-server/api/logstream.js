'use strict';

const readline =require('readline')
    , a2h = require('ansi2html-extended')
    , spawn = require('child_process').spawn;

function tailf(path){
  let tail = spawn('tail', ['-f', '-n 100', path]);
  let rl = readline.createInterface({
    input: tail.stdout,
    output: tail.stdin
  });
  rl.kill = function(){ tail.kill(); }
  return rl;
}

function stylize(str){
  if(!str) return '<span class="ansi_console_snippet">&#8203;</span>';
  return a2h.fromString({wrapped: true}, str)
}

module.exports = function(server){
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    let tail = tailf('/tmp/minamo/build.log');
    tail.on('line', line => socket.emit('line', stylize(line)));
    tail.on('disconnect', () => tail.kill());
  });
  return io;
}
