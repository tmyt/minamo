'use strict';

const pty = require('node-pty')
    , crypto = require('crypto')
    , bluebird = require('bluebird')
    , tar = require('tar-stream')
    , config = require('../config')
    , Docker = require('../lib/tools/docker')
    , docker = bluebird.promisifyAll(new Docker());

function waitStream(stream, json){
  return new Promise(done => {
    stream.on('data', x => {
      const str = x.toString();
      if(json){
        console.log(JSON.parse(str).status);
      }else{
        console.log(str);
      }
    });
    stream.on('end', () => {
      done();
    });
  });
}

module.exports = function(io){
  require('./io-auth')(io, '/term').on('connection', async (socket) => {
    const user = socket.request.user;
    const userData = 'shelldata.' + crypto.createHash('sha1')
      .update(`${user.name}`).digest('hex');
    const name = 'tmp' + crypto.createHash('sha1').update(`${Date.now()}`).digest('hex');
    const dataCont = docker.getContainer(userData);
    const sid = socket.request.headers.cookie.split(';').map(x => x.trim().split('='))
      .reduce((pv,c) => ((pv[c[0]] = c[1]), pv), {})['connect.sid'];
    const pack = tar.pack();
    pack.entry({name: '.mm/cookie'}, sid);
    pack.finalize();
    let isFirstTime = '';
    if(!await dataCont.statsAsync().catch(() => null)){
      const image = docker.getImage('budybox');
      if(!await image.inspectAsync().catch(() => null)){
        // pull busybox
        const stream = await docker.pull('busybox');
        await waitStream(stream, true);
      }
      await docker.createContainerAsync({Image: 'busybox', name: userData, Volumes: {'/home/user':{}}});
      isFirstTime = 'init';
    }
    const args = {
      name,
      Image: 'minamo-internal/shell',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      Tty: true,
      Cmd: [ '/init.sh', isFirstTime ],
      Env: [ 'MM_CACHE_PATH=/tmp', `MM_REMOTE_HOST=${config.proto}://${config.domain}` ],
      HostConfig: { AutoRemove: true, VolumesFrom: [ userData ] },
      NetworkingConfig: { EndpointsConfig: { 'shell': {} } }
    };
    const container = await docker.createContainerAsync(args);
    await container.putArchiveAsync(pack, {path: '/tmp'});
    const term = pty.spawn('docker', ['start', '-ai', name], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
    });
    socket.emit('init');
    socket.emit('data', '\r\n');
    term.on('data', d => socket.compress(true).emit('data', d));
    term.on('exit', d => socket.emit('exit', d));
    socket.on('data', d => term.write(d));
    socket.on('resize', d => { term.resize(d[0], d[1]); container.resizeAsync({w: d[0], h: d[1]}).catch(()=>{}); });
    socket.on('disconnect', async () => {
      term.destroy();
      await container.stopAsync().catch(()=>{});
    });
  });
};
