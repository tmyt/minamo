'use strict';

const express = require('express')
    , passport = require('passport')
    , fido2 = require('./fido2')
    , config = require('../../config');

function authRouter(provider){
  const authenticate = (req, res, next) => {
    const redir = req.session.redir || req.query._redir;
    const mode = req.user && (req.session.mode || req.query._mode);
    req.session.redir = redir;
    req.session.mode = mode;
    passport.authenticate(provider, (err, user, info) => {
      delete req.session.redir;
      delete req.session.mode;
      if(err) { return next(err); }
      if(!user) {
        const queryParams = [];
        const message = info && info.message;
        if(redir) queryParams.push(`_redir=${encodeURIComponent(redir)}`);
        if(message) queryParams.push(`_message=${encodeURIComponent(message)}`);
        return res.redirect(`/login${(queryParams.length && `?${queryParams.join('&')}`) || ''}`);
      }
      req.login(user, err => {
        if(err) { return next(err); }
        return res.redirect((redir && redir.startsWith('/')) ? redir : '/');
      });
    })(req, res, next);
  };
  const r = express.Router();
  r.get(`/${provider}()(/callback)?`, authenticate);
  r.post(`/${provider}()(/callback)?`, authenticate);
  return r;
}

const router = express.Router();
router.use('/', authRouter('github'), authRouter('local'), authRouter('fido2'));
// fido2 challenge
const hmacSecret = config.secret;
router.get('/fido2/get', (req, res) => {
  fido2.getAssertionOptions(req, res);
});
router.get('/fido2/create', (req, res) => {
  fido2.createAttestationOptions(req, res);
});
router.post('/fido2/register', async (req, res) => {
  fido2.verifyAttestationResult(req, res);
});
module.exports = router;
