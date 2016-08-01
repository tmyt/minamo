"use strict";

let path = require('path');
let exec = require('child_process').exec;
let fs = require('fs-extra');
let appReq = require('app-require');
let config = appReq('./config');

class Tools{

    build(repo){
        let extraEnv = fs.readJsonSync(path.join(config.repo_path, repo) + '.env');
        let envString = '';
        let envKeys = Object.keys(extraEnv);
        for(let i = 0; i < envKeys.length; ++i){
          envString += `ENV ${envKeys[i]} ${extraEnv[envKeys[i]]}\n`;
        }
        let env = {'DOMAIN': config.domain, 'EXTRAENV': envString};
        exec(path.join(__dirname, 'build.sh') + ' ' + repo, {env: env});
    }

    terminate(repo){
        exec(path.join(__dirname, 'terminate.sh') + ' ' + repo);
    }

}

module.exports = new Tools();
