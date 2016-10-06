'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;
const trustedUsers = config.GITHUB_TRUSTED_USERS;

module.exports = new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: config.proto + "://" + config.domain + "/auth/github/callback"
  }, function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      if(trustedUsers.indexOf(profile.username) < 0) return done(null, false);
      return done(null, {
        username: profile.username,
        provider: profile.provider,
        avatar: profile._json.avatar_url + '&s=80'
      });
    });
  }
);
