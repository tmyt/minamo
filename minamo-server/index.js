"use strict";

let config = require('./config');

// WebUI
let express = require('express');
let app = express();

// simple logger
app.use(function(req, res, next){
    console.log('[%s] %s - %s', (new Date()).toLocaleString(), req.method, req.url);
    next();
});

// handler
app.get('/', function(req, res){
    res.send('OK');
});

// routers
let api = require('./api');
app.use('/api', new api(express.Router()));
app.use('/console', express.static('./public'));

// git
let expressGit = require('express-git');
let githttp = express();
let git = expressGit.serve(config.repo_path, {
    auto_init: false
});
githttp.use('/', git);
git.on('post-receive', function(repo, changes){
    let name = repo.name.split('/').reverse()[0];
    let tools = require('./tools');
    tools.build(name);
});

// listen
app.listen(3000);
githttp.listen(7000);
