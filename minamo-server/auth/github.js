"use strict";

let config = require('../config.js');
let GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = 'xxxx';
const GITHUB_CLIENT_SECRET = 'xxxx';

const trustedUsers = [];

module.exports = new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://" + config.domain + "/auth/github/callback"
    }, function(accessToken, refreshToken, profile, done){
        console.log(accessToken, refreshToken, profile);
        process.nextTick(function(){
            if(trustedUsers.indexOf(profile.username) >= 0) return done(null, profile);
            return done(null, false);
        });
    }
);
