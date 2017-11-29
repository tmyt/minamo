'use strict';

const exec = require('child_process').exec;

class RamUsage{
  constructor(){
    this.wide = false;
    exec('free --help', (err, out) => {
      this.wide = out.includes('-w');
    });
  }
  exec(){
    return new Promise(resolve => {
      exec(`free ${this.wide ? '-w' : ''}`, (err, out) => resolve(out.toString()));
    });
  }
  next(){
    return this.exec().then(out => {
      const lines = out.replace(/ +/g, ' ').split('\n');
      const phy = lines[1].split(' ').map(Number);
      const swap = (lines[3] ? lines[3] : lines[2]).split(' ').map(Number);
      return {
        used: (this.wide ? (phy[2] - phy[4]) : (phy[2] - phy[4] - phy[5] - phy[6])) / 1024,
        free: phy[3] / 1024,
        shared: phy[4] / 1024,
        buffers: phy[5] / 1024,
        cached: phy[6] / 1024,
        swap: swap[2] / 1024
      };
    });
  }
  summary(values){
    const ret = {used: 0, free: 0, shared: 0, buffers: 0, cached: 0, swap: 0};
    for(let i = 0; i < values.length; ++i){
      ret.used += values[i].used;
      ret.free += values[i].free;
      ret.shared += values[i].shared;
      ret.buffers += values[i].buffers;
      ret.cached += values[i].cached;
      ret.swap += values[i].swap;
    }
    ret.used /= values.length;
    ret.free /= values.length;
    ret.shared /= values.length;
    ret.buffers /= values.length;
    ret.cached /= values.length;
    ret.swap /= values.length;
    return ret;
  }
}

module.exports = RamUsage;
