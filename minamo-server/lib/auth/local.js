'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , LocalStrategy = require('passport-local').Strategy
    , userDb = new (require('./userdb'))(config.userdb);

module.exports = new LocalStrategy({
    usernameField: 'username', passwordField: 'password'
  }, function(username, password, done){
    process.nextTick(function(){
      userDb.authenticate(username, password)
        .then(u => {
          if(!u){
            return done(null, false, {message: 'Incorrect username or password'});
          }
          return done(null, {
            username: u.username,
            provider: 'local',
            avatar: u.avatar
          });
        });
    });
  }
);
