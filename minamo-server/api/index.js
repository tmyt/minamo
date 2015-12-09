"use strict";

let path = require('path');
let fs = require('fs');
let init = require('git-init');
let exec = require('child_process').exec;

let config = require('../config');

let docker = new Docker({sockerPath: "/var/run/docker.sock"});

class api {
    constructor(app){
        app.get('/create', this.create);
        app.get('/destroy', this.destroy);
        app.get('/list', this.list);
        app.get('/status', this.status);
        return app;
    }

    create(req, res){
        if(!req.param('service')){
            res.send('error: no service');
            return;
        }
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, req.param('service'));
        if(pathExists(repo)){
            res.send('error: service already exists');
        }else{
            init(repo, true, function(err){
                res.send('create OK: ' + err);
            });
        }
    }

    destroy(req, res){
        res.send('destroy OK');
    }

    list(req, res){
        fs.readdir(config.repo_path, function(err, files){
            res.send(files);
        });
    }

    status(req, res){
        docker.listContainers(function(err, containers){
console.log(err);
           res.send(containers);
        });
    }
};

function pathExists(name){
    try{
        fs.statSync(name);
    }catch(e){
        return false;
    }
    return true;
}

module.exports = api;
