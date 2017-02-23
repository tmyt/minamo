'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = config.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = config.TWITTER_CONSUMER_SECRET;
const trustedUsers = config.TWITTER_TRUSTED_USERS;

module.exports = new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: config.proto + "://" + config.domain + "/auth/twitter/callback"
  }, function(token, tokenSecret, profile, done){
    process.nextTick(function(){
      if(trustedUsers.indexOf(profile.username) < 0){
        return done(null, false, {message: 'You are not authorized to access the requested resource.'});
      }
      return done(null, {
        username: profile.username,
        provider: profile.provider,
        avatar: profile._json.profile_image_url_https
      });
    });
  }
);
