'use strict';

const appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(require('./userdb'))(config.userdb)
    , Fido2Strategy = require('passport-fido2').Strategy;

const strategy = new Fido2Strategy({
  passReqToCallback: true,
  hmacSecret: config.secret,
  origin: 'https://minamo.io',
  rpName: 'minamo.io',
  rpId: 'minamo.io',
  rpIcon: 'https://minamo.io/icon.png',
  readProfile: async (id, callback) => {
    const key = await userDb.getPublicKeyForId(id);
    if(!key) return callback('key does not exists', null, null);
    callback(null, {});
  },
  readPublicKeyIdsForUser: (username, callback) => {
    userDb.getPublicKeyIdsForUserId(username)
    .then(ids => {
      callback(ids.map(id => ({
        id, type: 'public-key', transports: [ 'internal' ],
      })));
    });
  },
  readPublicKeyForId: (id, callback) => {
    userDb.getPublicKeyForId(id)
    .then(key => {
      callback(key)
    });
  }}, async function(req, id, profile, done){
    if(req.user && req.session.mode === 'connect'){
      await userDb.addSocialId(req.user.username, profile.provider, profile.id);
      return done(null, req.user);
    }
    process.nextTick(async function(){
      const user = await userDb.authenticateWithFido2(id);
      if(!user){
        return done(null, false, {message: 'You are not permitted to access the requested resource.'});
      }
      return done(null, {
        username: user.username,
        role: user.role,
        avatar: user.avatar
      });
    });
  }
);


module.exports = strategy;

/*** Assertion (Authentication) ***/

module.exports.getAssertionOptions = function(req, res){
  if(!req.query.username) return res.send(400);
  strategy.assertionOptions(req, req.query.username, (err, opts) => {
    if(err) return res.status(500).send(err);
    req.session['user-id'] = req.query.username;
    res.send(opts);
  });
};

/*** Attestation (Registration) ***/

module.exports.createAttestationOptions = function(req, res){
  if(!req.user) return res.send(400);
  const username = req.user.username;
  strategy.attestationOptions(req, (err, opts) => {
    opts.user = {
      displayName: username,
      id: username,
      name: username,
    };
    res.send(opts);
  });
};

module.exports.verifyAttestationResult = function(req, res){
  if(!req.user) return res.send(400);
  try{
    strategy.attestationResult(req, async (err, result) => {
      if(err) return res.status(500).send(`${err.message}`);
      await userDb.addPublicKey(req.user.username, result.request.id, result.authnrData.get('credentialPublicKeyPem'));
      res.sendStatus(200);
    });
  }catch(e){
    res.sendStatus(500);
  }
};
