'use strict';

const path = require('path')
    , exec = require('child_process').exec
    , fs = require('fs-extra')
    , shellescape = require('shell-escape')
    , appReq = require('app-require')
    , config = appReq('./config');

const $ = require('bluebird').promisifyAll
    , Docker = require('dockerode')
    , docker = $(new Docker());

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
      envString += `${envKeys[i]}=${shellescape([extraEnv[envKeys[i]]])} `;
    }
    let engine = extraEnv['MINAMO_NODE_VERSION'] || '';
    if(!engine.match('^[0-9.]+$')) engine = '';
    let env = Object.assign({'DOMAIN': config.domain, 'EXTRAENV': envString,
      'MINAMO_NODE_VERSION': engine || 'latest'}, extraPackages);
    exec(path.join(__dirname, 'build.sh') + ' ' + repo, {env: env});
  }

  async terminate(repo, destroy){
    if(!repo) return;
    // stopping flag
    await $(fs).mkdirAsync('/tmp/minamo/').catch(()=>{});
    await $(fs).writeFileAsync(`/tmp/minamo/${repo}.term`);
    // remove current container & image
    const cont = $(docker.getContainer(repo));
    await cont.stopAsync().catch(()=>{});
    await cont.removeAsync().catch(()=>{});
    await $(docker.getImage(`minamo/${repo}`)).removeAsync().catch(()=>{});
    if(destroy){
      await this.destroy(repo);
    }
    // remove flag
    await $(fs).unlinkAsync(`/tmp/minamo/${repo}.term`).catch(()=>{});
  }

  async restart(repo){
    if(!repo) return;
    const cont = docker.getContainer(repo);
    // container has not built
    if(!cont){ return this.build(repo); }
    // preparing flag
    await $(fs).mkdirAsync('/tmp/minamo/').catch(()=>{});
    await $(fs).writeFileAsync(`/tmp/minamo/${repo}.prep`);
    // restart container
    await $(cont).restart().catch(()=>{});
    await $(fs).unlinkAsync(`/tmp/minamo/${repo}.prep`).catch(()=>{});
  }

  async destroy(repo){
    await $(docker.getContainer(repo)).removeAsync().catch(()=>{});
    await $(docker.getImage(`minamo/${repo}`)).removeAsync().catch(()=>{});
    await $(docker.getContainer(`${repo}-data`)).removeAsync().catch(()=>{});
    await $(docker.getImage(`minamo/${repo}-data`)).removeAsync().catch(()=>{});
  }
}

module.exports = new Tools();
