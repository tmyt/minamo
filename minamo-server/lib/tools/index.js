"use strict";

let path = require('path');
let exec = require('child_process').exec;
let appReq = require('app-require');
let config = appReq('./config');

class Tools{

    build(repo){
        let env = {'DOMAIN': config.domain};
        exec(path.join(__dirname, 'build.sh') + ' ' + repo, {env: env});
    }

    terminate(repo){
        exec(path.join(__dirname, 'terminate.sh') + ' ' + repo);
    }

}

module.exports = new Tools();
