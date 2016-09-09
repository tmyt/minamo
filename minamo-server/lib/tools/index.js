'use strict';

const path = require('path')
  , exec = require('child_process').exec
  , fs = require('fs-extra')
  , appReq = require('app-require')
  , config = appReq('./config');

class Tools{

  getRequiredPackages(extraEnv){
    let extraPackages = {};
    let packages = (extraEnv['MINAMO_REQUIRED_PACKAGES'] || '').split(',');
    for(let i = 0; i < packages.length; ++i){
      if(!packages[i].trim()) continue;
      extraPackages['MINAMO_BUILD_REQUIRED_' + packages[i].toUpperCase()] = 'true';
    }
    return extraPackages;
  }

  build(repo){
    let extraEnv = fs.readJsonSync(path.join(config.repo_path, repo) + '.env');
    let envString = '';
    let envKeys = Object.keys(extraEnv);
    let extraPackages = this.getRequiredPackages(extraEnv);
    for(let i = 0; i < envKeys.length; ++i){
      if(envKeys[i] === 'MINAMO_REQUIRED_PACKAGES') continue;
      if(envKeys[i] === 'MINAMO_NODE_VERSION') continue;
      envString += `${envKeys[i]}="${extraEnv[envKeys[i]]}" `;
    }
    let engine = extraEnv['MINAMO_NODE_VERSION'] || '';
    if(!engine.match('^[0-9.]+$')) engine = '';
    let env = Object.assign({'DOMAIN': config.domain, 'EXTRAENV': envString,
      'MINAMO_NODE_VERSION': engine || 'latest'}, extraPackages);
    exec(path.join(__dirname, 'build.sh') + ' ' + repo, {env: env});
  }

  terminate(repo, destroy){
    exec(path.join(__dirname, 'terminate.sh') + ' ' + repo);
    if(destroy){
      exec(path.join(__dirname, 'destroy.sh') + ' ' + repo);
    }
  }

}

module.exports = new Tools();
