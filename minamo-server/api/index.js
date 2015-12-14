"use strict";

let path = require('path');
let fs = require('fs');
let init = require('git-init');
let head = require('githead');
let exec = require('child_process').exec;

let config = require('../config');
let tools = require('../tools');

class api {
    constructor(app){
        app.get('/create', this.create);
        app.get('/destroy', this.destroy);
        app.get('/start', this.start);
        app.get('/stop', this.stop);
        app.get('/restart', this.restart);
        app.get('/list', this.list);
        app.get('/status', this.status);
        return app;
    }

    checkParams(req, res){
        var name = req.query.service;
        if(!name){
            res.send('error: no service');
            return;
        }
        if(!name.match(/^[a-zA-Z0-9-]+$/)){
            res.send('error: service should be [a-zA-Z0-9-]+');
            return;
        }
        return name;
    }

    create(req, res){
        var name = this.checkParams(req, res);
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(pathExists(repo)){
            res.send('error: service already exists');
        }else{
            init(repo, true, function(err){
                res.send('create OK: ' + err);
            });
        }
    }

    destroy(req, res){
        var name = this.checkParams(req, res);
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.terminate(name);
            exec('rm -rf ' + repo); 
            res.send('destroy OK');
        }
    }

    restart(req, res){
        var name = this.checkParams(req, res);
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.build(name);
            res.send('create OK: ' + err);
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
                    if(files[i][0] === '.') continue;
                    statuses[files[i]] = {
                        'status': 'stopped',
                        'uptime': '',
                        'created': '',
                        'head': head(path.join(config.repo_path, files[i]))
                    };
                    for(let j = 0; j < containers.length; ++j){
                        if(containers[j].names[0] === ('/' + files[i])){
                            statuses[files[i]].status = 'running';
                            statuses[files[i]].uptime = containers[j].status;
                            statuses[files[i]].created = containers[j].created;
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
