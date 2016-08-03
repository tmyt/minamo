'use strict';

const path = require('path')
  , exec = require('child_process').exec
  , fs = require('fs-extra')
  , appReq = require('app-require')
  , config = appReq('./config');

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
