'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new (require('./userdb'))(config.userdb)
    , LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'username',
  passwordField: 'password'
}, async function(req, username, password, done){
  if(req.user && req.session.mode === 'connect'){
    await userDb.addSocialId(req.user.username, req.user.provider, req.user.id);
    return done(null, req.user);
  }
  process.nextTick(async function(){
    const user = await userDb.authenticate(username, password);
    if(!user){
      return done(null, false, {message: 'Incorrect username or password'});
    }
    return done(null, {
      username: user.username,
      role: user.role,
      avatar: user.avatar
    });
  });
});
