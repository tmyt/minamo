'use strict';

/*
 * Redis protocol based light weight kvs implementation.
 */

const net = require('net');

const $ = require('bluebird').promisifyAll
    , Docker = require('dockerode')
    , docker = $(new Docker());

function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

class Kvs
{
  constructor(rootDomain){
    this.methods = {
      get: this.get,
      keys: this.keys
    };
    this.rootDomain = `.${rootDomain}`;
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
        const method = args.shift().toLowerCase();
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
  async getContainerEndpointAsync(host){
    if(!host.endsWith(this.rootDomain)) return '';
    const name = host.slice(0, -this.rootDomain.length);
    const container = $(docker.getContainer(name));
    try{
      const data = await container.inspectAsync();
      if(!data.NetworkSettings.Ports) return ''
      const bind = Object.keys(data.NetworkSettings.Ports)[0];
      const port = bind.split('/')[0];
      return `http://${data.NetworkSettings.IPAddress}:${port}`;
    }catch(e){
      return '';
    }
  }
  //
  async get(res, key){
    if(!!this.hosts[key]){
      res.write('$' + this.hosts[key].length + '\r\n');
      res.write(this.hosts[key] + '\r\n');
    }else if(this.hosts[key] === ''){
      const endpoint = await this.getContainerEndpointAsync(key);
      res.write('$' + endpoint.length + '\r\n');
      res.write(endpoint + '\r\n');
      this.hosts[key] = endpoint;
    }else{
      res.write('$-1\r\n');
    }
  }
  keys(res, pattern){
    const re = new RegExp('^' + escapeRegExp(pattern).replace('\\*', '.*'));
    let k = Object.keys(this.hosts).filter(s => re.test(s));
    res.write(`*${k.length}\r\n`);
    for(let i = 0; i < k.length; ++i){
      res.write('$' + k[i].length + '\r\n');
      res.write(k[i] + '\r\n');
    }
  }
}

module.exports = Kvs;
