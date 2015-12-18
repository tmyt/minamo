"use strict";

let appReq = require('app-require');
let config = appReq('./config');
let TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = 'xxxx';
const TWITTER_CONSUMER_SECRET = 'xxxx';

const trustedUsers = [];

module.exports = new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: "http://" + config.domain + "/auth/twitter/callback"
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
            if(trustedUsers.indexOf(profile.username) < 0) return done(null, false);
            return done(null, {
                username: profile.username,
                provider: profile.provider,
                avatar: profile._json.profile_image_url_https
            });
        });
    }
);
