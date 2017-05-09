'use strict';

const readline = require('readline')
    , spawn = require('child_process').spawn;

function tailf(path){
  const tail = spawn('tail', ['-f', '-n 300', path]);
  const rl = readline.createInterface({
    input: tail.stdout,
    output: tail.stdin
  });
  rl.kill = function(){ tail.kill(); };
  return rl;
}

module.exports = function(io){
  io.of('/log').on('connection', socket => {
    const tail = tailf('/tmp/minamo/build.log');
    tail.on('line', line => {
      socket.emit('data', `${line}\r\n`);
    });
    socket.on('disconnect', () => tail.kill());
  });
};
