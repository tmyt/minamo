'use strict';

module.exports = function(io, ns){
  return io.of(ns).use((data, next) => {
    if(data.request.user.logged_in) return next();
    next(new Error('io-auth:unauthorized'));
  });
};
