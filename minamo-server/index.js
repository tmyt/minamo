"use strict";

let config = require('./config');

// WebUI
let express = require('express');
let app = express();

// handler
app.get('/', function(req, res){
    res.send('OK');
});

// routers
let api = require('./api');
app.use('/api', new api(express.Router()));

// git
let expressGit = require('express-git');
var git = express();
git.use('/', expressGit.serve(config.repo_path, {
    auto_init: false
}));

git.on('post-receive', function(repo, changes){
    console.log(repo);
});

// listen
app.listen(3000);
git.listen(7000);
