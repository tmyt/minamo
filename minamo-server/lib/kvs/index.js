'use strict';

/*
 * Redis protocol based light weight kvs implementation.
 */

const net = require('net')
    , config = require('../../config.js');

const Docker = require('dockerode')
    , docker = new Docker({socketPath: '/var/run/docker.sock'});

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
      if(rest < 0 && input[0] === '*'){
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
        rest = -1;
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
    docker.getContainer(container).inspect((err, data) => {
      let bind = Object.keys(data.NetworkSettings.Ports)[0];
      let port = bind.split('/')[0];
      callback(`http://${data.NetworkSettings.IPAddress}:${port}`);
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
