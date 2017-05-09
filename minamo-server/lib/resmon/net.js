'use strict';

const ifstat = require('ifstat');

class NetUsage{
  constructor(iface = 'eth0'){
    this.name = iface;
    this.iface = this.get();
  }
  get(){
    return ifstat().filter(x => x.iface === this.name)[0];
  }
  next(){
    const current = this.get();
    const ret = {
      tx: (current.tx.bytes - this.iface.tx.bytes) / 1024,
      rx: (current.rx.bytes - this.iface.rx.bytes) / 1024,
    };
    this.iface = current;
    return ret;
  }
  summary(values){
    const ret = {tx:0, rx: 0};
    for(let i = 0; i < values.length; ++i){
      ret.tx += values[i].tx;
      ret.rx += values[i].rx;
    }
    ret.tx /= values.length;
    ret.rx /= values.length;
    return ret;
  }
}

module.exports = NetUsage;
