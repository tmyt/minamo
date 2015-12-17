"use strict";

let config = require('../config');
let TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = 'xxxx';
const TWITTER_CONSUMER_SECRET = 'xxxx';

const trustedUsers = [];

module.exports = new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: "http://" + config.domain + "/auth/twitter/callback"
    }, function(token, tokenSecret, profile, done){
        console.log(token, tokenSecret, profile);
        process.nextTick(function(){
            if(trustedUsers.indexOf(profile.username) >= 0) return done(null, profile);
            return done(null, false);
        });
    }
);
