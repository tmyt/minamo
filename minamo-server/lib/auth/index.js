'use strict';

const express = require('express')
    , router = express.Router()
    , passport = require('passport');

function auth(provider, failure){
    let opt = undefined;
    if(failure) opt = {failureRedirect: failure};
    return passport.authenticate(provider, opt);
}

function authRouter(provider){
    let r = express.Router();
    let authFunc = auth(provider, '/login');
    let callback = function(req, res){ res.redirect('/'); };
    r.get(`/${provider}/`, authFunc, callback);
    r.get(`/${provider}/callback`, authFunc, callback);
    r.post(`/${provider}/`, authFunc, callback);
    r.post(`/${provider}/callback`, authFunc, callback);
    return r;
}

router.use('/', authRouter('twitter'));
router.use('/', authRouter('github'));
router.use('/', authRouter('local'));

module.exports = router;
