'use strict';

module.exports = function(io, f){
  require('./io-auth')(io, '/services/logs').on('connection', async (socket) => {
    const service = socket.request.headers['x-minamo-service'];
    const process = require('child_process').spawn('docker', ['logs', '-f', service]);
    // check params
    if(!await f(socket.request)){
      socket.emit('data', 'service not found\n');
      socket.emit('exit');
      return;
    }
    socket.emit('init');
    socket.emit('data', '\r\n');
    process.stdout.on('data', d => socket.emit('data', d));
    process.stdout.on('end', () => socket.emit('exit'));
    process.stderr.on('data', d => socket.emit('data', d));
    process.stderr.on('end', () => socket.emit('exit'));
    socket.on('disconnect', () => process.kill());
  });
};
