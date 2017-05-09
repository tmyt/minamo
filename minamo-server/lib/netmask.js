'use strict';

module.exports = function(addr, nw, mask){
  const maskBits = mask.split('.').map(Number);
  const nwBits = nw.split('.').map(Number);
  const addrBits = addr.split('.').map(Number);
  for(let i = 0; i < 4; ++i){
    if((addrBits[i] & maskBits[i]) !== (nwBits[i] & maskBits[i])){
      return false;
    }
  }
  return true;
};
