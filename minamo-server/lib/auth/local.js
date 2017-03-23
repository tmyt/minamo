'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new (require('./userdb'))(config.userdb)
    , LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'username', passwordField: 'password'
  }, function(username, password, done){
    process.nextTick(async function(){
      const user = await userDb.authenticate(username, password);
      if(!user){
        return done(null, false, {message: 'Incorrect username or password'});
      }
      return done(null, {
        username: user.username,
        provider: 'obsolete',
        avatar: user.avatar
      });
    });
  }
);
