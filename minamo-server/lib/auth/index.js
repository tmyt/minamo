'use strict';

const express = require('express')
    , router = express.Router()
    , passport = require('passport');

function authRouter(provider){
  const r = express.Router();
  const opts = { failureRedirect: '/login' };
  const _next = passport.authenticate(provider, opts);
  const _start = (req, res, next) => {
    req.session.redir = req.query._redir;
    _next(req, res, next);
  };
  const _callback = (req, res) => {
    const redir = req.session.redir;
    delete req.session.redir;
    res.redirect(redir || '/');
  };
  r.get(`/${provider}/`, _start);
  r.get(`/${provider}/callback`, _next, _callback);
  r.post(`/${provider}/`, _start);
  r.post(`/${provider}/callback`, _start, _callback);
  return r;
}

router.use('/', authRouter('twitter'));
router.use('/', authRouter('github'));
router.use('/', authRouter('local'));

module.exports = router;
