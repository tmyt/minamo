"use strict";

let path = require('path');
let appReq = require('app-require');
let config = appReq('./config');

// WebUI
let jadeStatic = appReq('./lib/jade/static');
let express = require('express');
let passport = require('passport');
let app = express();

app.set('view engine', 'jade');

// setup passport
passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, obj);
});

passport.use(appReq('./lib/auth/twitter'));
passport.use(appReq('./lib/auth/github'));

// simple logger
app.use(function(req, res, next){
    console.log('[%s] %s - %s', (new Date()).toLocaleString(), req.method, req.url);
    next();
});

// setup auth
app.use(require('express-session')({
    secret: 'kuroshio',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', appReq('./lib/auth'));

// handlers
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// routers
let api = appReq('./api');
app.use('/api', requireAuthentication, new api(express.Router()));
app.use('/console', requireAuthentication, jadeStatic(path.resolve('./views')));
app.use('/', jadeStatic(path.resolve('./views')));
app.use('/', express.static('./public'));

// git
let expressGit = require('express-git');
let githttp = express();
let git = expressGit.serve(config.repo_path, {
    auto_init: false
});
githttp.use('/', git);
git.on('post-receive', function(repo, changes){
    let name = repo.name.split('/').reverse()[0];
    let tools = appReq('./lib/tools');
    tools.build(name);
});

// listen
app.listen(3000);
githttp.listen(7000);

function requireAuthentication(req, res, next){
    if(req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
