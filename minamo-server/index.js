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
let pushover = require('pushover');
let repos = pushover(config.repo_path, {autoCreate: false});

let http = require('http');
let git = http.createServer(repos.handle);

// listen
app.listen(3000);
git.listen(7000);
