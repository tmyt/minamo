'use strict';

const passport = require('passport-strategy')
    , jwkToPem = require('jwk-to-pem')
    , path = require('path')
    , fs = require('fs')
    , crypto = require('crypto')
    , appReq = require('app-require')
    , config = appReq('./config');

const hash = data => {
  return crypto.createHash('sha1').update(data).digest('hex');
};

class Fido2Strategy extends passport.Strategy{
  constructor(options, verify){
    super();
    if(typeof options === 'function'){
      verify = options;
      options = {};
    }
    this.name = 'fido2';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
  }
  authenticate(req){
    const id = req.query.id.toLowerCase();
    fs.readFile(path.join(__dirname, `../../data/fido2/${hash(id)}.json`), (err, key) => {
      key = key && JSON.parse(key);
      if(err || !key) { return this.fail({message: 'Could not find user'}, 400); }
      const digest = crypto.createHash('sha256').update(new Buffer(req.query.clientData, 'base64')).digest();
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(new Buffer(req.query.authenticatorData, 'base64')).update(digest);
      if(!verify.verify(jwkToPem(key), req.query.signature, 'base64')){
        return this.fail({message: 'Failed verification signature'}, 400);
      }
      const verified = (err, user, info) => {
        if(err) { return this.error(err); }
        if(!user) { return this.fail(info); }
        this.success(user, info);
      }
      try{
        if(this._passReqToCallback){
          this._verify(req, id, verified);
        }else{
          this._verify(id, verified);
        }
      }catch(e){
        return this.error(e);
      }
    });
  }
};

module.exports = new Fido2Strategy(
  {}, function(id, done){
    process.nextTick(function(){
      return done(null, {
        username: id,
        provider: 'fido2',
        avatar: '/img/default.gif'
      });
    });
  }
);
