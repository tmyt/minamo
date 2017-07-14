'use strict';

const ResMon = require('../lib/resmon');

module.exports = function(io){
  const sockets = require('./io-auth')(io, '/sysinfo');
  const mon = new ResMon(5, 300);
  mon.on('next', d => {
    sockets.emit('next', d);
  });
  mon.on('summary', d => {
    sockets.emit('summary', d);
  });
  sockets.on('connect', s => {
    s.emit('history', mon.history());
  });
  mon.start();
};
