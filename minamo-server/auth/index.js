"use strict";

let express = require('express');
let router = express.Router();
let passport = require('passport');

function auth(provider, failure){
    let opt = undefined;
    if(failure) opt = {failureRedirect: failure};
    return passport.authenticate(provider, opt);
}

function authRouter(provider){
    let r = express.Router();
    r.get(`/${provider}/`, auth(provider), function(req, res){ });
    r.get(`/${provider}/callback`, auth(provider, '/login'), function(req, res){
        res.redirect('/');
    });
    return r;
}

router.use('/', authRouter('twitter'));
router.use('/', authRouter('github'));

module.exports = router;
