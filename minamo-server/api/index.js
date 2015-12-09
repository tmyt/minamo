"use strict";

let path = require('path');
let fs = require('fs');
let init = require('git-init');
let exec = require('child_process').exec;

let config = require('../config');
let tools = require('../tools');

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
        if(!req.param('service')){
            res.send('error: no service');
            return;
        }
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, req.param('service'));
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.terminate(req.param('service'));
            exec('rm -rf ' + repo); 
            res.send('destroy OK');
        }
    }

    list(req, res){
        fs.readdir(config.repo_path, function(err, files){
            res.send(files);
        });
    }

    status(req, res){
        let ps = require('docker-ps');
        ps(function(err, containers){
            let statuses = {};
            fs.readdir(config.repo_path, function(err, files){
                for(let i = 0; i < files.length; ++i){
                    statuses[files[i]] = 'stopped';
                    for(let j = 0; j < containers.length; ++j){
                        if(containers[j].names[0] === ('/' + files[i])){
                            statuses[files[i]] = 'running';
                            break;
                        }
                    }
                }
                res.send(statuses);
            });
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
