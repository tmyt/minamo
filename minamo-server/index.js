"use strict";

let path = require('path');
let fs = require('fs-extra');
let fsWatcher = fs.FSWatcher;
let appReq = require('app-require');
let config = appReq('./config');

// WebUI
let jadeStatic = appReq('./lib/jade/static');
let express = require('express');
let passport = require('passport');
let basicAuth = require('basic-auth-connect');
let bodyParser = require('body-parser');
let app = express();
let gitusers = {};

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
    console.log('[%s] %s - %s (%s)', (new Date()).toLocaleString(),
        req.method, req.url, req.headers['user-agent']);
    next();
});

// setup auth
app.use(bodyParser.urlencoded({extended: true}));
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
let gitauth = basicAuth(function(user, pass){
    return user !== undefined && pass !== undefined &&
        gitusers[user] !== undefined && gitusers[user] === pass;
});
githttp.use(gitauth);
githttp.use('/', git);
git.on('post-receive', function(repo, changes){
    let name = repo.name.split('/').reverse()[0];
    let tools = appReq('./lib/tools');
    tools.build(name);
});

// create empty users file if not found
let gitusersPath = path.join(__dirname, '/data/gitusers.json');
try{
    fs.statSync(gitusersPath);
}catch(e){
    fs.writeJsonSync(gitusersPath, {});
}

// load credentials & listen
fs.readJson(gitusersPath, function(err, data){
    if(!err) gitusers = data;
    app.listen(3000);
    githttp.listen(7000);
});

// watch auth file update
let watcher = fs.watch(gitusersPath, function(name, e){
    fs.readJson(gitusersPath, function(err, data){
        if(!err) gitusers = data;
    });
});


function requireAuthentication(req, res, next){
    if(req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

