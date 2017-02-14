'use strict';

const bluebird = require('bluebird')
    , Docker = require('dockerode');

const names = ['getContainer', 'getImage', 'getVolume',
               'getPlugin', 'getService', 'getTask',
               'getNode', 'getNetwork', 'getSecret', 'getExec'];
const functions = {};
for(let i = 0; i < names.length; ++i){
  const func = Docker.prototype[names[i]];
  Docker.prototype[names[i]] = function(...args){
    const ret = func.apply(this, args);
    if(!ret) return ret;
    return bluebird.promisifyAll(ret);
  }
}
module.exports = Docker;
