'use strict';

const os = require('os')

class CpuUsage{
  constructor(){
    this.cpus = os.cpus();
    this.at = Date.now();
  }
  next(){
    const current = os.cpus();
    const ret = {user: 0, system: 0};
    const now = Date.now();
    for(let i = 0; i < current.length; ++i){
      ret.user += current[i].times.user;
      ret.user += current[i].times.nice;
      ret.user -= this.cpus[i].times.user;
      ret.user -= this.cpus[i].times.nice;
      ret.system += current[i].times.sys;
      ret.system += current[i].times.irq;
      ret.system -= this.cpus[i].times.sys;
      ret.system -= this.cpus[i].times.irq;
    }
    ret.user /= (100 * ((now - this.at) / 1000));
    ret.system /= (100 * ((now - this.at) / 1000));
    this.cpus = current;
    this.at = now;
    return ret;
  }
  summary(values){
    const ret = {user:0, system: 0};
    for(let i = 0; i < values.length; ++i){
      ret.user += values[i].user;
      ret.system += values[i].system;
    }
    ret.user /= values.length;
    ret.system /= values.length;
    return ret;
  }
}

module.exports = CpuUsage;
