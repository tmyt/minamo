'use strict';

const express = require('express')
    , passport = require('passport');

function authRouter(provider){
  const authenticate = (req, res, next) => {
    const redir = req.session.redir || req.query._redir;
    req.session.redir = redir;
    passport.authenticate(provider, (err, user, info) => {
      delete req.session.redir;
      if(err) { return next(err); }
      if(!user) { return res.redirect(`/login${redir?`?_redir=${encodeURIComponent(redir)}`:''}`); }
      req.login(user, err => {
        if(err) { return next(err); }
        return res.redirect(redir || '/');
      });
    })(req, res, next);
  };
  const r = express.Router();
  r.get(`/${provider}()(/callback)?`, authenticate);
  r.post(`/${provider}()(/callback)?`, authenticate);
  return r;
}

const router = express.Router()
router.use('/', authRouter('github'), authRouter('twitter'), authRouter('local'));

module.exports = router;
