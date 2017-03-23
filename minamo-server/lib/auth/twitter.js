'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(require('./userdb'))(config.userdb)
    , TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = config.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = config.TWITTER_CONSUMER_SECRET;

module.exports = new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: config.proto + "://" + config.domain + "/auth/twitter/callback"
  }, function(token, tokenSecret, profile, done){
    process.nextTick(async function(){
      const user = await userDb.authenticateWithSocialId(profile.provider, profile.id);
      if(!user){
        return done(null, false, {message: 'You are not permitted to access the requested resource.'});
      }
      return done(null, {
        username: user.username,
        provider: 'obsolete',
        avatar: user.avatar
      });
    });
  }
);
