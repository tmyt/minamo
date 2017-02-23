'use strict';

const Fido2Strategy = require('passport-fido2').Strategy
    , path = require('path')
    , fs = require('fs')
    , crypto = require('crypto');

module.exports = new Fido2Strategy({
  readProfile: (id, callback) => {
    const hash = crypto.createHash('sha1').update(id).digest('hex');
    const file = path.join(__dirname, `../../data/fido2/${hash}.json`);
    fs.readFile(file, (err, data) => {
      if(err) return callback(err, null, null);
      try{ data = JSON.parse(data) } catch(e) { return callback(e, null, null) }
      callback(null, data.key, data.profile);
    });
  }}, function(id, profile, done){
    process.nextTick(function(){
      return done(null, {
        username: profile.username,
        provider: 'fido2:' + profile.provider,
        avatar: profile.avatar
      });
    });
  }
);
