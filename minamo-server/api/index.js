"use strict";

let path = require('path');
let fs = require('fs-extra');
let tarball = require('tarball-extract');
let init = require('git-init');
let head = require('githead');
let exec = require('child_process').exec;
let appReq = require('app-require');
let mutex = require('node-mutex')();

let config = appReq('./config');
let tools = appReq('./lib/tools');

function checkParams(req, res){
    var name = req.query.service;
    if(!name){
        res.send('error: no service');
        return;
    }
    if(!name.match(/^[a-z0-9-]+$/)){
        res.send('error: service should be [a-z0-9-]+');
        return;
    }
    return name;
}


class api {
    constructor(app){
        app.get('/create', this.create);
        app.get('/destroy', this.destroy);
        app.get('/start', this.start);
        app.get('/stop', this.stop);
        app.get('/restart', this.restart);
        app.get('/list', this.list);
        app.get('/status', this.status);
        app.post('/credentials/update', this.updateCredentials);
        return app;
    }

    create(req, res){
        var name = checkParams(req, res);
        let template = req.query.template || '';
        if(!name) return;
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(pathExists(repo)){
            res.send('error: service already exists');
            return;
        }
        let root = path.dirname(require.main.filename);
        let templatePath = path.join(root, '/lib/templates/' + template + '.tar.gz');
        let initFunc = function(templ, cb){
            init(repo, true, templ, function(err){
                if(cb) cb();
                res.send('create OK: ' + err);
            });
        };
        if(template === ''){
            initFunc('');
        }else{
            let rand = Math.floor(Math.random() * 65535);
            let tmpl = '/tmp/minamo-' + rand + '/';
            tarball.extractTarball(templatePath, tmpl, function(err){
                initFunc(tmpl, function(){ fs.removeSync(tmpl); });
            });
        }
    }

    destroy(req, res){
        var name = checkParams(req, res);
        if(!name) return;
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.terminate(name);
            fs.remove(repo, function(){ res.send('destroy OK'); })
        }
    }

    start(req, res){
        var name = checkParams(req, res);
        if(!name) return;
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.build(name);
            res.send('start OK');
        }
    }

    stop(req, res){
        var name = checkParams(req, res);
        if(!name) return;
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.terminate(name);
            res.send('stop OK');
        }
    }

    restart(req, res){
        var name = checkParams(req, res);
        if(!name) return;
        // .git is no required. its seems library bug.
        let repo = path.join(config.repo_path, name);
        if(!pathExists(repo)){
            res.send('error: service not found');
        }else{
            tools.build(name);
            res.send('restart OK');
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
                    try{
                      fs.statSync('/tmp/minamo/' + files[i] + '.prep');
                      statuses[files[i]].status = 'prepareing';
                    }catch(e){ }
                    try{
                      fs.statSync('/tmp/minamo/' + files[i] + '.term');
                      statuses[files[i]].status = 'stopping';
                    }catch(e){ }
                }
                res.send(statuses);
            });
        });
    }

    updateCredentials(req, res){
        let usersPath = path.join(__dirname, '../data/gitusers.json');
        if(!req.user.username || !req.body.password ||
            req.user.username === '' || req.body.password === '') return res.send(400);
        mutex.lock('gitusers-json', function(err, unlock){
            fs.readJson(usersPath, function(err, data){
                data[req.user.username] = req.body.password;
                fs.outputJson(usersPath, data, function(){
                    res.send('OK');
                    unlock();
                });
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
