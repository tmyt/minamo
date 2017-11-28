'use strict';

const nativeInterfaces = require('bindings')('interfaces');

const IF_DEV = 0
    , IF_ADDRESS = 1
    , IF_FAMILY = 2;

const ADDRESS = 0
    , NETMASK = 1;

const AF_INET = 2
    , AF_INET6 = 10;

function toByte(n, i){
  return (n >> (i * 8)) & 0xff;
}

function toInet(n){
  return `${toByte(n, 0)}.${toByte(n, 1)}.${toByte(n, 2)}.${toByte(n, 3)}`;
}

function toInet6(n){
  const addr = n.map(x => x.toString(16)).join(':')
    .replace(/:0(:0)+/, ':')
    .replace(/^0::/, '::');
  return addr.endsWith(':') ? addr + ':' : addr;
}

function inet(a){
  return {
    address: toInet(a[ADDRESS]),
    netmask: toInet(a[NETMASK]),
  };
}

function inet6(a){
  return {
    address: toInet6(a[ADDRESS]),
    netmask: toInet6(a[NETMASK]),
  };
}

function interfaces(){
  const all = nativeInterfaces.all();
  const ifaces = {};
  for(let i = 0; i < all.length; ++i){
    const iface = all[i][IF_DEV];
    if(!ifaces[iface]){
      ifaces[iface] = { ipv4: [], ipv6: [] };
    }
    switch(all[i][IF_FAMILY]){
      case AF_INET: // ipv4
        ifaces[iface].ipv4.push(inet(all[i][IF_ADDRESS]));
        break;
      case AF_INET6: // ipv6
        ifaces[iface].ipv6.push(inet6(all[i][IF_ADDRESS]));
        break;
    }
  }
  return ifaces;
}

module.exports = interfaces;
