'use strict';

/*
 * Redis protocol based light weight kvs implementation.
 */

const net = require('net')
    , config = require('../../config.js');

class Kvs
{
  constructor(){
    this.methods = {
      get: this.get,
      keys: this.keys
    };
    this.hosts = {};
    this.server = net.createServer(this.serverCreated.bind(this));
  }
  serverCreated(client){
    const rl = require('readline').createInterface({
      input: client,
      output: undefined
    });
    let rest = -1;
    let command = '';
    let args = [];
    let argBytes = -1;
    rl.on('line', input => {
      if(input[0] === '*'){
        args = [];
        rest = parseInt(input.substr(1));
        return;
      }
      if(argBytes < 0 && input[0] === '$'){
        argBytes = parseInt(input.substr(1));
        return;
      }
      if(argBytes >= 0){
        args.push(input);
        argBytes = -1;
        rest -= 1;
      }
      if(rest === 0){
        let method = args.shift().toLowerCase();
        if(this.methods[method]){
          args.unshift(client);
          this.methods[method].apply(this, args);
        }else{
          client.write('-ERROR\r\n');
        }
      }
    });
  }
  listen(port){
    this.server.listen(port, '127.0.0.1');
  }
  addHost(host){
    if(this.hosts[host] === undefined){
      this.hosts[host] = '';
    }
  }
  delHost(host){
    delete this.hosts[host];
  }
  resetHost(host){
    this.delHost(host);
    this.addHost(host);
  }
  getContainerEndpoint(host, callback){
    if(!host.endsWith(config.domain)) return callback('');
    let container = host.substr(0, host.length - config.domain.length - 1);
    let exec = require('child_process').exec;
    exec("docker inspect --format='{{.NetworkSettings.IPAddress}}:{{range $k,$v:=.NetworkSettings.Ports}}{{$k}}{{end}}' " + container, (error, stdout, stderr) => {
      let target = stdout.split('/')[0];
      let comp = target.split(':');
      if(!comp[0] || !comp[1]) return callback('');
      callback('http://' + target);
    });
  }
  //
  get(res, key){
    if(!!this.hosts[key]){
      res.write('$' + this.hosts[key].length + '\r\n');
      res.write(this.hosts[key] + '\r\n');
    }else if(this.hosts[key] === ''){
      this.getContainerEndpoint(key, endpoint => {
        res.write('$' + endpoint.length + '\r\n');
        res.write(endpoint + '\r\n');
        this.hosts[key] = endpoint;
      });
    }else{
      res.write('$-1\r\n');
    }
  }
  keys(res){
    let k = Object.keys(this.hosts);
    res.write(`*${k.length}\r\n`);
    for(let i = 0; i < k.length; ++i){
      res.write('$' + k[i].length + '\r\n');
      res.write(k[i] + '\r\n');
    }
  }
}

module.exports = Kvs;
