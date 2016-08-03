'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , LocalStrategy = require('passport-local').Strategy;

const users = config.LOCAL_USERS;

module.exports = new LocalStrategy({
    usernameField: 'username', passwordField: 'password'
  }, function(username, password, done){
    process.nextTick(function(){
      if(!users[username] || users[username] !== password){
        return done(null, false);
      }
      return done(null, {
        username: username,
        provider: 'local',
        avatar: '/img/default.gif'
      });
    });
  }
);
