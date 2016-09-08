'use strict';

const path = require('path')
    , fs = require('fs-extra')
    , appReq = require('app-require')
    , config = appReq('./config');

// WebUI
const jadeStatic = appReq('./lib/jade/static')
    , express = require('express')
    , passport = require('passport')
    , basicAuth = require('basic-auth-connect')
    , bodyParser = require('body-parser')
    , app = express()
    , server = require('http').Server(app)
    , io = require('./api/logstream')(server)
    , kvs = new (require('./lib/kvs'))();

let gitusers = {};

app.set('view engine', 'jade');

// setup passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(appReq('./lib/auth/twitter'));
passport.use(appReq('./lib/auth/github'));
passport.use(appReq('./lib/auth/local'));

// simple logger
app.use((req, res, next) => {
  console.log('%s - - [%s] %s %s (%s)', req.headers['x-forwarded-for'],
    (new Date()).toLocaleString(), req.method, req.url, req.headers['user-agent']);
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
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.get('/api/hooks/:repo', appReq('./api/hooks'));
app.post('/api/hooks/:repo', appReq('./api/hooks'));

// routers
let api = appReq('./api');
app.use('/api', rejectIfNotAuthenticated, new api(express.Router(), kvs));
app.use('/console', requireAuthentication, jadeStatic(path.resolve('./views')));
app.use('/logstream', requireAuthentication, jadeStatic(path.resolve('./views')));
app.use('/', jadeStatic(path.resolve('./views')));
app.use('/', express.static('./public', {maxAge: 3600 * 1000}));

// git
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
  if(req.headers['x-forwarded-for'].match(/^172.17/)){
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
  server.listen(3000, '127.0.0.1');
  githttp.listen(7000, '127.0.0.1');
  kvs.listen(config.redis_port);
});

// watch auth file update
let watcher = fs.watch(gitusersPath, (name, e) => {
  fs.readJson(gitusersPath, (err, data) => {
    if(!err) gitusers = data;
  });
});

function requireAuthentication(req, res, next){
  if(req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

function rejectIfNotAuthenticated(req, res, next){
  if(req.isAuthenticated()) { return next(); }
  res.status(401).send();
}
