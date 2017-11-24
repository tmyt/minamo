const nativeInterfaces = require('bindings')('interfaces');

function interfaces(){
  const all = nativeInterfaces.all();
  const ifaces = {};
  for(let i = 0; i < all.length; ++i){
    const iface = all[i][0];
    if(!ifaces[iface]){
      ifaces[iface] = { ipv4: [], ipv6: [] };
    }
    if(all[i].length == 2){
      // ipv4
      const addr = `${(all[i][1]      ) & 0xff}.`
                 + `${(all[i][1] >>  8) & 0xff}.`
                 + `${(all[i][1] >> 16) & 0xff}.`
                 + `${(all[i][1] >> 24) & 0xff}`;
      ifaces[iface].ipv4.push(addr);
    }else{
      // ipv6
      const parts = [];
      for(let j = 0; j < 8; ++j){
        const part = (all[i][1 + j * 2] << 8)
                   + (all[i][2 + j * 2]);
        parts.push(part.toString(16));
      }
      const addr = parts.join(':')
        .replace(/:0(:0)+/, ':')
        .replace(/^0::/, '::');
      ifaces[iface].ipv6.push(addr);
    }
  }
  return ifaces;
}

module.exports = interfaces;
