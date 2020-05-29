'use strict';

const bluebird = require('bluebird')
    , path = require('path')
    , fs = bluebird.promisifyAll(require('fs-extra'))
    , tar = bluebird.promisifyAll(require('tar-stream'))
    , shellescape = require('shell-escape')
    , appReq = require('app-require')
    , config = appReq('./config');

const Docker = require('./docker')
    , docker = bluebird.promisifyAll(new Docker())
    , logger = new (require('./logger'))('/tmp/minamo/build.log')
    , networkInterfaces = require('../network/interfaces');

function waitForStreamEndAsync(stream){
  return new Promise(resolve => {
    stream.on('end', resolve);
  });
}

async function containerExistsAsync(container){
  try{
    await container.statsAsync();
  }catch(e){
    return false;
  }
  return true;
}

class Tools{
  getRequiredPackages(extraEnv){
    const extraPackages = {};
    const packages = (extraEnv['MINAMO_REQUIRED_PACKAGES'] || '').split(',');
    for(let i = 0; i < packages.length; ++i){
      if(!packages[i].trim()) continue;
      extraPackages[packages[i].toLowerCase()] = 'true';
    }
    return extraPackages;
  }

  async build(repo){
    if(!repo) return;
    let repoUri = `http://git.${config.domain}/${repo}.git`;
    // check lock
    if((await fs.statAsync(`/tmp/minamo/${repo}.lock`).catch(()=>{}))){
      // locked
      return;
    }
    await fs.writeFileAsync(`/tmp/minamo/${repo}.lock`, '');
    // read external repo uri if available
    const type = (await fs.statAsync(`${config.repo_path}/${repo}`).catch(()=>{}));
    if(type.isFile()){
      repoUri = await fs.readFileAsync(`${config.repo_path}/${repo}`);
    }
    // prepareing flag
    await fs.mkdirpAsync('/tmp/minamo').catch(()=>{});
    await fs.writeFileAsync(`/tmp/minamo/${repo}.prep`, '');
    // move old container to staging
    const cont = docker.getContainer(repo);
    if(await containerExistsAsync(cont)){
      logger.emit('rename old container...');
      // remove current container & image
      await cont.renameAsync({name: `${repo}-staging`}).catch(()=>{});
      await docker.getImage(`minamo/${repo}`).tagAsync({repo: `minamo/${repo}-staging`}).catch(()=>{});
    }
    try{
      await this.buildAndRun(repo, repoUri);
    }catch(e){ console.log(e); }
    // cleanup prep file
    await fs.unlinkAsync(`/tmp/minamo/${repo}.prep`);
    // clear lock file
    await fs.unlinkAsync(`/tmp/minamo/${repo}.lock`);
  }

  async buildAndRun(repo, repoUri){
    const extraEnv = await fs.readJsonAsync(path.join(config.repo_path, repo) + '.env');
    const envKeys = Object.keys(extraEnv);
    const extras = this.getRequiredPackages(extraEnv);
    let envString = '';
    for(let i = 0; i < envKeys.length; ++i){
      if(envKeys[i].startsWith('MINAMO_')) continue;
      envString += `${envKeys[i]}=${shellescape([extraEnv[envKeys[i]]])} `;
    }
    let engine = extraEnv['MINAMO_NODE_VERSION'] || '';
    if(!engine.match('^[0-9.]+$')) engine = '';
    const version = engine || 'latest';
    // remove container if disable zero-downtime deploy
    if(extraEnv['MINAMO_DISABLE_ZDD']){
      await fs.writeFileAsync(`/tmp/minamo/${repo}.term`, '');
      await this.removeStaging(repo);
      await fs.unlinkAsync(`/tmp/minamo/${repo}.term`);
    }
    // optional container argument
    const restartPolicy = extraEnv['MINAMO_RESTART_POLICY'] || '';
    // create data container
    const dataCont = docker.getContainer(`${repo}-data`);
    if(!await containerExistsAsync(dataCont)){
      await docker.createContainerAsync({Image: 'busybox', name: `${repo}-data`, Volumes: {'/data':{}}});
    }
    // prepare building
    const port = ~~(Math.random() * 32768) + 3000;
    // get docker0 ip addr
    const docker0 = networkInterfaces()['docker0'].ipv4[0].address;
    // listup extra packages
    let pkgs = Object.keys(extras).filter(x => x[0] === '@')
      .map(x => shellescape([x.substring(1)])).join(' ');
    if(extras['redis']){
      pkgs = `${pkgs} redis-server`;
    }
    if(pkgs.trim() !== ''){
      pkgs = `RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ${pkgs}`;
    }
    // determine package manager
    let pm = 'npm';
    let pmInstall = '';
    if(extras['yarn']){
      pm = '~/.yarn/bin/yarn';
      pmInstall = '(curl -o- -L https://yarnpkg.com/install.sh | bash); ';
    }
    const extraCmd = extraEnv['MINAMO_EXTRA_CMD']  ? `RUN ${extraEnv['MINAMO_EXTRA_CMD']}` : '';
    const extraStep = extraEnv['MINAMO_EXTRA_STEP'] ? `${extraEnv['MINAMO_EXTRA_STEP']} ;` : '';
    // generate Dockerfile
    const dockerfile = `FROM node:${version}\n`
                     + `ENV PORT=${port} MINAMO_BRANCH_NAME=master ${envString}\n`
                     + `EXPOSE ${port}\n`
                     + `${pkgs}\n`
                     + `RUN adduser minamo; mkdir -p /service/${repo}; chown -R minamo:minamo /service/\n`
                     + `ADD run.sh /service/run.sh\n`
                     + `RUN chmod 755 /service/run.sh\n`
                     + `WORKDIR /service/${repo}\n`
                     + `${extraCmd}\n`
                     + `RUN echo ${docker0} git.${config.domain} >> /etc/hosts; su minamo -c "git clone ${repoUri} . --recursive && git checkout $MINAMO_BRANCH_NAME"; \\\n`
                     + `    su minamo -c "${pmInstall} ${pm} run minamo-preinstall ; ${pm} install ; ${extraStep} ${pm} run minamo-postinstall || true"; \\\n`
                     + `    ls -l; node --version\n`
                     + `CMD ["/service/run.sh"]`;
    // generate startup script
    const runSh = `#!/bin/sh\n`
                + `# ${(new Date()).toLocaleString()}\n`
                + `chown -R minamo:minamo /data\n`
                + (extras['redis'] ? `/etc/init.d/redis-server start\n` : '')
                + `su minamo -c '${pm} start'`;
    // pack context
    const context = tar.pack();
    context.entry({name: 'Dockerfile'}, dockerfile);
    context.entry({name: 'run.sh'}, runSh);
    context.finalize();
    // Start docker build
    logger.emit('====================');
    logger.emit('Building with');
    logger.emit(dockerfile);
    logger.emit('Pulling image...');
    const pullStream = await docker.pullAsync(`node:${version}`);
    logger.emit(pullStream, true);
    await waitForStreamEndAsync(pullStream);
    const buildStream = await docker.buildImageAsync(context, {t: `minamo/${repo}:latest`, rm: true, forcerm: true});
    logger.emit(buildStream, true);
    await waitForStreamEndAsync(buildStream);
    // LOG('Docker build exited with ${?}')
    // run container
    logger.emit(`Starting container ${repo}`);
    const links = (extraEnv['MINAMO_LINKS'] || '').split(',').filter(s => !!s).map(s => `${s}:${s}`);
    const policy = restartPolicy ? { Name: restartPolicy } : undefined;
    await docker.createContainerAsync({Image: `minamo/${repo}`, name: repo, VolumesFrom: [ `${repo}-data` ], Links: links, RestartPolicy: policy });
    await docker.getContainer(repo).startAsync();
    logger.emit('started');
  }

  async removeStaging(repo){
    const cont = docker.getContainer(`${repo}-staging`);
    if(await containerExistsAsync(cont)){
      logger.emit('remove old container...');
      // remove current container & image
      await cont.stopAsync().catch(()=>{});
      await cont.removeAsync().catch(()=>{});
      await docker.getImage(`minamo/${repo}-staging`).removeAsync().catch(()=>{});
    }
  }

  async terminate(repo, destroy){
    if(!repo) return;
    // stopping flag
    await fs.mkdirpAsync('/tmp/minamo/').catch(()=>{});
    await fs.writeFileAsync(`/tmp/minamo/${repo}.term`, '');
    // remove current container & image
    const cont = docker.getContainer(repo);
    await cont.stopAsync().catch(()=>{});
    await cont.removeAsync().catch(()=>{});
    await docker.getImage(`minamo/${repo}`).removeAsync().catch(()=>{});
    if(destroy){
      await this.destroy(repo);
    }
    // remove flag
    await fs.unlinkAsync(`/tmp/minamo/${repo}.term`).catch(()=>{});
  }

  async restart(repo){
    if(!repo) return;
    const cont = docker.getContainer(repo);
    // container has not built
    if(!(await cont.inspectAsync().catch(()=>null))){ return await this.build(repo); }
    // preparing flag
    await fs.mkdirpAsync('/tmp/minamo/').catch(()=>{});
    await fs.writeFileAsync(`/tmp/minamo/${repo}.prep`, '');
    // restart container
    await cont.restartAsync().catch(()=>{});
    await fs.unlinkAsync(`/tmp/minamo/${repo}.prep`).catch(()=>{});
  }

  async destroy(repo){
    await docker.getContainer(repo).removeAsync().catch(()=>{});
    await docker.getImage(`minamo/${repo}`).removeAsync().catch(()=>{});
    await docker.getContainer(`${repo}-data`).removeAsync().catch(()=>{});
    await docker.getImage(`minamo/${repo}-data`).removeAsync().catch(()=>{});
  }

  async isRunning(repo){
    const cont = docker.getContainer(repo);
    const inspect = await cont.inspectAsync().catch(()=>null);
    if(!inspect) return false;
    return inspect.State.Status === 'running';
  }
}

module.exports = new Tools();
