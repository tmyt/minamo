"use strict";

let express = require('express');
let router = express.Router();
let passport = require('passport');

router.get('/twitter/', passport.authenticate('twitter'), function(req, res){
});

router.get('/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login.html'}), function(req, res){
    res.redirect('/');
});

router.get('/github/', passport.authenticate('github'), function(req, res){
});

router.get('/github/callback', passport.authenticate('github', {failureRedirect: '/login.html'}), function(req, res){
    res.redirect('/');
});

module.exports = router;
