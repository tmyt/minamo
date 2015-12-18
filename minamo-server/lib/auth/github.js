"use strict";

let appReq = require('app-require');
let config = appReq('./config');
let GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = 'xxxx';
const GITHUB_CLIENT_SECRET = 'xxxx';

const trustedUsers = [];

module.exports = new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://" + config.domain + "/auth/github/callback"
    }, function(accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            if(trustedUsers.indexOf(profile.username) < 0) return done(null, false);
            return done(null, {
              username: profile.username,
              provider: profile.provider,
              avatar: profile._json.avatar_url
            });
        });
    }
);
