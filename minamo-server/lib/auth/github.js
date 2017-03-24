'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(require('./userdb'))(config.userdb)
    , GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;

module.exports = new GitHubStrategy({
    passReqToCallback: true,
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: config.proto + "://" + config.domain + "/auth/github/callback"
  }, async function(req, accessToken, refreshToken, profile, done){
    if(req.user && req.session.mode === 'connect'){
      await userDb.addSocialId(req.user.username, profile.provider, profile.id);
      return done(null, req.user);
    }
    process.nextTick(async function(){
      const user = await userDb.authenticateWithSocialId(profile.provider, profile.id);
      if(!user){
        return done(null, false, {message: 'You are not authorized to access the requested resource.'});
      }
      return done(null, {
        username: user.username,
        role: user.role,
        avatar: user.avatar
      });
    });
  }
);
