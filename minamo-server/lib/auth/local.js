"use strict";

let appReq = require('app-require');
let config = appReq('./config');
let LocalStrategy = require('passport-local').Strategy;

const users = {};

module.exports = new LocalStrategy({
        usernameField: 'username', passwordField: 'password'
    }, function(username, password, done){
        process.nextTick(function(){
            if(!users[username] || users[username] !== password){
                return done(null, false);
            }
            return done(null, {
                username: username,
                provider: 'local',
                avatar: '/img/default.gif'
            });
        });
    }
);
