'use strict';

const path = require('path')
    , fs = require('fs-extra')
    , appReq = require('app-require')
    , config = appReq('./config');

// WebUI
const pugStatic = appReq('./lib/pug/static')
    , express = require('express')
    , expressSession = require('express-session')
    , FileStore = require('session-file-store')(expressSession)
    , passport = require('passport')
    , basicAuth = require('basic-auth-connect')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , app = express()
    , server = require('http').Server(app)
    , passportSocketIo = require('passport.socketio')
    , io = require('socket.io')(server)
    , kvs = new (require('./lib/kvs'))();

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

// handlers
app.set('view engine', 'pug');
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.get('/api/hooks/:repo', appReq('./api/hooks')(kvs));
app.post('/api/hooks/:repo', appReq('./api/hooks')(kvs));

// routers
let api = appReq('./api');
app.use('/api', rejectIfNotAuthenticated, new api(express.Router(), kvs, io));
app.use('/console', requireAuthentication, pugStatic(path.resolve('./views')));
app.use('/', pugStatic(path.resolve('./views')));
app.use('/', express.static('./public', {maxAge: '7d'}));
require('./api/logstream.js')(io);
require('./api/terminal.js')(io);

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
  if(req.query._token){
    res.cookie('connect.sid', req.query._token);
    if(req.isAuthenticated()) return next();
    return res.redirect(req.baseUrl);
  }
  if(req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

function rejectIfNotAuthenticated(req, res, next){
  if(req.isAuthenticated()) { return next(); }
  res.status(401).send();
}
