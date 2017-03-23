'use strict';

const path = require('path')
    , fs = require('fs')
    , crypto = require('crypto')
    , appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(require('./userdb'))(config.userdb)
    , Fido2Strategy = require('passport-fido2').Strategy;

module.exports = new Fido2Strategy({
  passReqToCallback: true,
  readProfile: async (id, callback) => {
    const key = await userDb.getPublicKeyForId(id);
    if(!key) return callback('key does not exists', null, null);
    callback(null, key, {});
  }}, async function(req, id, profile, done){
    if(req.user && req.session.mode === 'connect'){
      await userDb.addSocialId(req.user.username, profile.provider, profile.id);
      return done(null, req.user);
    }
    process.nextTick(async function(){
      const user = await userDb.authenticateWithFido2(id);
      if(!user){
        return done(null, false, {message: 'You are not permitted to access the requested resource.'});
      }
      return done(null, {
        username: user.username,
        provider: 'obsolete',
        role: user.role,
        avatar: user.avatar
      });
    });
  }
);
