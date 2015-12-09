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
let githttp = express();
let git = expressGit.serve(config.repo_path, {
    auto_init: false
});
githttp.use('/', git);
git.on('post-receive', function(repo, changes){
    let name = repo.name.split('/').reverse()[0];
    let exec = require('child_process').exec;
    let path = require('path');
    exec(path.resolve('../build.sh') + ' ' + name, function(err, sin, sout){ });
});

// listen
app.listen(3000);
githttp.listen(7000);
