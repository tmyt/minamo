'use strict';

const pty = require('pty.js');

module.exports = function(io){
  io.of('/term').on('connection', socket => {
    let term = pty.spawn('bash', ['-l'], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      env: {
        HOME: process.env.HOME,
        SHELL: '/bin/bash',
        USER: process.env.USER,
        LANG: process.env.LANG
      }
    });
    socket.emit('init');
    socket.emit('data', '\r\n');
    term.on('data', d => socket.compress(true).emit('data', d));
    term.on('exit', d => socket.emit('exit', d));
    socket.on('data', d => term.write(d));
    socket.on('resize', d => term.resize(d[0], d[1]));
    socket.on('disconnect', () => term.destroy());
  });
}
