'use strict';

// nodejs modules
const express = require('express')
    , http = require('http')
    , SocketIo = require('socket.io')
    , path = require('path')
    , fs = require('fs-extra')
// app modules
const appReq = require('app-require')
    , config = appReq('./config')
    , RedisServer = require('./lib/kvs');
// app instance
const app = express()
    , server = http.createServer(app)
    , io = SocketIo(server,  {perMessageDeflate: {threshold: 128}})
    , kvs = new RedisServer(config.domain);
// React
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import DocumentTitle from 'react-document-title';
import { routes } from './src/routes';
// WebUI
const expressSession = require('express-session')
    , morgan = require('morgan')
    , FileStore = require('session-file-store')(expressSession)
    , passport = require('passport')
    , basicAuth = require('basic-auth-connect')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , passportSocketIo = require('passport.socketio')

// setup passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(appReq('./lib/auth/twitter'));
passport.use(appReq('./lib/auth/github'));
passport.use(appReq('./lib/auth/local'));
passport.use(appReq('./lib/auth/fido2'));

// enable log
app.enable('trust proxy');
app.use(morgan('combined'));

// setup auth
let sessionStore = new FileStore({path: __dirname + '/data/sessions', retries: 2, ttl: 604800});
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSession({
  store: sessionStore,
  secret: 'kuroshio',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', appReq('./lib/auth'));
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  secret: 'kuroshio',
  store: sessionStore
}));

app.use(express.static('public', {maxage: '14d'}));
app.use('/fonts', express.static('node_modules/Umi/dist/fonts', {maxage: '14d'}));
app.set('view engine', 'pug');

// handlers
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
// routers
let api = appReq('./api');
app.use('/api', new api(express.Router(), kvs, io));

// handle authorized uris
app.get('/console(/*)?', requireAuthentication, handleReactRouter);
// handle others
app.get('*', handleReactRouter);

// git
let gitusers = {};
let expressGit = require('express-git');
let githttp = express();
let git = expressGit.serve(config.repo_path, {
  auto_init: false
});
let gitBasicAuth = basicAuth((user, pass) => {
  return user !== undefined && pass !== undefined &&
    gitusers[user] !== undefined && gitusers[user] === pass;
});
let gitComplexAuth = function(req, res, next){
  // accept access from container
  if(req.headers['x-forwarded-for'].match(/^172\.17\./)){
    next();
    return true;
  }
  return gitBasicAuth(req, res, next);
};
githttp.use(gitComplexAuth);
githttp.use('/', git);
git.on('post-receive', (repo, changes) => {
  let name = repo.name.split('/').reverse()[0];
  let tools = appReq('./lib/tools');
  kvs.resetHost(`${name}.${config.domain}`);
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
fs.readJson(gitusersPath, (err, data) => {
  if(!err) gitusers = data;
  server.listen(config.http_port || 3000, '127.0.0.1');
  githttp.listen(config.git_port || 7000, '127.0.0.1');
  kvs.listen(config.redis_port || 16379);
});

// watch auth file update
let watcher = fs.watch(gitusersPath, (name, e) => {
  fs.readJson(gitusersPath, (err, data) => {
    if(!err) gitusers = data;
  });
});

function requireAuthentication(req, res, next){
  req.requireAuthentication = true;
  if(req.query._token){
    res.cookie('connect.sid', req.query._token);
    if(req.isAuthenticated()) return next();
    return res.redirect(req.baseUrl);
  }
  if(req.isAuthenticated()) { return next(); }
  res.redirect('/login?_redir=' + encodeURIComponent(req.originalUrl));
}

function handleReactRouter(req, res){
  match({routes, location: req.url}, (err, redirectLocation, props) => {
    if(err){
      res.status(500).send(err.message);
    }else if(redirectLocation){
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    }else if(props){
      const auth = {isAuthenticated: req.isAuthenticated(), profile: req.user};
      const configJson = {proto: `${config.proto}:`, domain: config.domain};
      props.router.auth = auth;
      const markup = renderToString(<RouterContext {...props} />);
      const appProps = `window.APP_PROPS = ${JSON.stringify(auth)};`
        + ((req.requireAuthentication && auth.isAuthenticated && 'window.isVerified = true;') || '');
      const configJs = `window.MinamoConfig = ${JSON.stringify(configJson)};`;
      const title = DocumentTitle.rewind();
      res.render('index', {markup, appProps, configJs, title});
    }else{
      res.sendStatus(404);
    }
  });
}

