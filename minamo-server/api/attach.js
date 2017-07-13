'use strict';

const pty = require('node-pty');

module.exports = function(io, f){
  io.of('/attach').on('connection', async (socket) => {
    const user = socket.request.user;
    const service = socket.request.headers['x-minamo-service'];
    // check params
    if(!f(socket.request)){
      socket.emit('data', 'service not found\n');
      socket.emit('exit');
      return;
    }
    // attach container
    const term = pty.spawn('docker', ['exec', '-it', service, 'bash'], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
    });
    socket.emit('init');
    socket.emit('data', '\r\n');
    term.on('data', d => socket.compress(true).emit('data', d));
    term.on('exit', d => socket.emit('exit', d));
    socket.on('data', d => term.write(d));
    socket.on('resize', d => term.resize(d[0], d[1]));
    socket.on('disconnect', () => term.destroy());
  });
};
