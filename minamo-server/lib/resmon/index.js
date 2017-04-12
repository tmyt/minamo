'use strict';

const EventEmitter = require('events').EventEmitter

const probes = ['cpu', 'ram', 'net'];

class ResMon extends EventEmitter{
  constructor(step, summary){
    super();
    this.step = step * 1000;
    this.summary = summary * 1000;
    // init
    for(let i = 0; i < probes.length; ++i){
      this[probes[i]] = new (require(`./${probes[i]}`))();
    }
    const now = Date.now();
    this.log = {};
    this.log.short = Array.apply(null, new Array(60)).map((_, i) => ({
      date: now - (59 - i) * this.step
    }));
    this.log.long = Array.apply(null, new Array(288)).map((_, i) => ({
      date: now - (287 - i) * this.summary
    }));
  }
  start(){
    if(this.interval !== undefined) return;
    this.interval = setInterval(() => this.tick(), this.step);
    this.lastSummary = Date.now();
  }
  stop(){
    clearInterval(this.interval);
    this.interval = undefined;
  }
  async next(){
    return {
      cpu: this.cpu.next(),
      ram: await this.ram.next(),
      net: this.net.next(),
      date: Date.now(),
    };
  }
  async tick(){
    const cur = await this.next();
    this.log.short.push(cur);
    this.log.short.shift();
    this.emit('next', cur);
    // calc summary
    if(Date.now() - this.lastSummary >= this.summary){
      const points = (this.summary / this.interval + 0.5) | 0;
      const sum = { date: Date.now() };
      const slices = this.log.short.slice(59 - i);
      sum.cpu = this.cpu.summary(slices.map(x => x.cpu));
      sum.ram = this.ram.summary(slices.map(x => x.ram));
      sum.net = this.net.summary(slices.map(x => x.net));
      this.log.long.push(sum);
      this.log.long.shift();
      this.lastSummary = Date.now();
      this.emit('summary', sum);
    }
  }
  history(){
    return this.log;
  }
}

module.exports = ResMon;
