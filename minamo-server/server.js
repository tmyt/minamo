'use strict';

// nodejs modules
const express = require('express')
    , http = require('http')
    , SocketIo = require('socket.io')
    , path = require('path')
    , fs = require('fs')
    , url = require('url')
    , expressGit = require('express-git2')
    , networkInterfaces = require('./lib/network/interfaces');
// app modules
const appReq = require('app-require')
    , config = appReq('./config')
    , RedisServer = require('./lib/kvs')
    , userDb = new(require('./lib/auth/userdb'))(config.userdb)
    , netmask = require('./lib/network/netmask')
    , getFileProps = require('./lib/fileprops');
// app instance
const app = express()
    , server = http.createServer(app)
    , io = SocketIo(server,  {perMessageDeflate: {threshold: 128}})
    , kvs = new RedisServer(config.domain);
// React
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { getLoadableState } from 'loadable-components/server';
import DocumentTitle from 'react-document-title';
import Routes from './src/routes';
// WebUI
const expressSession = require('express-session')
    , morgan = require('morgan')
    , FileStore = require('session-file-store')(expressSession)
    , passport = require('passport')
    , basicAuth = require('basic-auth-connect')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , passportSocketIo = require('passport.socketio')
    , csp = require('express-csp-header')
    , responseTime = require('response-time');

// setup passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET){
  passport.use(appReq('./lib/auth/github'));
}else{
  console.log('W: GitHub auth is not configured.');
}
passport.use(appReq('./lib/auth/local'));
passport.use(appReq('./lib/auth/fido2'));

// enable log
app.enable('trust proxy');
app.use(responseTime());
app.use(morgan('combined'));

// setup auth
const sessionStore = new FileStore({path: __dirname + '/data/sessions', retries: 2, ttl: 604800});
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSession({
  store: sessionStore,
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(csp({
  policies: {
    'default-src': [ csp.SELF ],
    'script-src': [ csp.SELF, config.cdn ],
    'style-src': [ csp.INLINE, 'cdnjs.cloudflare.com' ],
    'img-src': [ csp.SELF, 'data:' ],
    'font-src': [ csp.SELF, 'fonts.gstatic.com', 'cdnjs.cloudflare.com' ],
    'connect-src': [ csp.SELF, `${config.proto === 'https' ? 'wss' : 'ws'}://${config.domain}` ],
  }
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', `${config.proto}://${config.domain}`);
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', appReq('./lib/auth'));
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  secret: config.secret,
  store: sessionStore,
  // accept all request at this time.
  // but controled in delegated namespace.
  success: (data, accept) => accept(),
  fail: (data, _, __, accept) => accept(),
}));

app.use(express.static('public', {maxage: '14d'}));
app.use('/avatar', express.static(path.join(config.data_dir, 'avatar'), {maxage: '14d'}));
app.use('/fonts', express.static('node_modules/Umi/dist/fonts', {maxage: '14d'}));
if(config.cdn !== ''){
  app.use('*', (req, res, next) => {
    if(req.headers['x-host']){ return res.sendStatus(400); }
    next();
  });
}
app.set('view engine', 'pug');

// handlers
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
// routers
app.use('/api', new(require('./api'))(kvs, io));
// handle others
app.get('*', handleReactRouter);

// git
const githttp = express();
const git = expressGit.serve(config.repo_path, {
  auto_init: false
});
const gitBasicAuth = basicAuth((user, pass, next) => {
  userDb.authenticate(user, pass)
    .then(u => next(null, u))
    .catch(e => next(e, null));
});
const gitComplexAuth = function(req, res, next){
  // accept access from container
  const xRealIp = req.headers['x-real-ip'];
  const iface = networkInterfaces().docker0.ipv4[0];
  if(iface && xRealIp && netmask(xRealIp, iface.address, iface.netmask)){
    next();
    return true;
  }
  return gitBasicAuth(req, res, next);
};
const gitFixUri = function(req, res, next){
  const parsed = url.parse(req.url);
  const match = parsed.pathname.match(/^\/([^/]*?)\/(.*)/);
  if(!match[1].endsWith('.git')){
    parsed.pathname = `/${match[1]}.git/${match[2]}`;
    req.url = url.format(parsed);
  }
  return next();
};
githttp.use('/', gitComplexAuth, gitFixUri, gitFixUri, git);
git.on('post-receive', async (repo, changes) => {
  const name = repo.name.split('/').reverse()[0];
  const container = appReq('./lib/container');
  fs.readFile(path.join(config.repo_path, `${name}.env`), async (err, json) => {
    const env = JSON.parse(json);
    const changedRefs = changes.filter(x => x.ref.startsWith('refs/heads/'))
      .map(x => x.ref.substring('refs/heads/'.length));
    const targetBranch = env['MINAMO_BRANCH_NAME'] || 'master';
    if(!changedRefs.includes(targetBranch)){
      return; // ignore. push ref is not current branch
    }
    await container.build(name);
    kvs.resetHost(`${name}.${config.domain}`);
    await container.removeStaging(name);
  });
});

// listen servers
server.listen(config.http_port || 3000, '127.0.0.1');
githttp.listen(config.git_port || 7000, '127.0.0.1');
kvs.listen(config.redis_port || 16379, '127.0.0.1');
fs.mkdir('/tmp/minamo', () => {});
console.log('I: minamo service started');

async function handleReactRouter(req, res){
  /* for test purpose only */
  /*
  if(req.query._token){
    res.cookie('connect.sid', req.query._token);
    if(!req.isAuthenticated()){
      return res.redirect(req.baseUrl);
    }
  }
  */
  const context = { profile: req.user, config };
  const app = (
    <StaticRouter location={req.url} context={context}>
      <Routes server/>
    </StaticRouter>
  );
  getLoadableState(app).then(async loadableState => {
    const markup = renderToString(app).replace(/ class=""/g, '');
    if(context.url){
      res.redirect(302, context.url);
    }else if(!context.status || context.status === 200){
      const metas = [
        ['mo:scheme', config.proto],
        ['mo:domain', config.domain],
        ['mo:site', config.title],
      ];
      if(req.user){
        metas.push(['mo:user', req.user.username]);
        metas.push(['mo:role', req.user.role]);
        metas.push(['mo:avatar', req.user.avatar]);
        if(context.authorizationRequired){
          metas.push(['mo:authorized', 'true']);
        }
      }
      if(loadableState.componentIds){
        metas.push(['mo:components', JSON.stringify(loadableState.componentIds)]);
      }
      const preconnect = [
        '<https://fonts.gstatic.com>; rel=preconnect',
        '<https://cdnjs.cloudflare.com>; rel=preconnect',
      ];
      if(config.cdn){
        preconnect.push(`<${config.proto}://${config.cdn}>; rel=preconnect`);
      }
      res.header('Link', preconnect.join(', '));
      const title = DocumentTitle.rewind();
      const scripts = [
        await getFileProps('./public/loader.js'),
        await getFileProps('./public/styles.js'),
        await getFileProps('./public/bundle.js'),
      ];
      const cdn = config.cdn ? `//${config.cdn}` : '';
      res.render('index', {markup, title, metas, scripts, cdn});
    }else{
      res.sendStatus(404);
    }
  });
}

process.on('unhandledRejection', console.dir);
