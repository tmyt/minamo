'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(require('./userdb'))(config.userdb)
    , GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;

module.exports = new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: config.proto + "://" + config.domain + "/auth/github/callback"
  }, function(accessToken, refreshToken, profile, done){
    process.nextTick(async function(){
      const user = await userDb.authenticateWithSocialId(profile.provider, profile.username);
      if(!user){
        return done(null, false, {message: 'You are not authorized to access the requested resource.'});
      }
      return done(null, {
        username: user.username,
        provider: 'obsolete',
        avatar: user.avatar
      });
    });
  }
);
