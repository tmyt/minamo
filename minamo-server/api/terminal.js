'use strict';

const pty = require('pty.js');

module.exports = function(io){
  io.of('/term').on('connection', socket => {
    let term = pty.spawn('bash', [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24
    });
    socket.emit('init');
    socket.emit('data', '\r\n');
    term.on('data', d => socket.emit('data', d));
    socket.on('data', d => term.write(d));
    socket.on('resize', d => term.resize(d[0], d[1]));
    socket.on('disconnect', () => term.destroy());
  });
}
