'use strict';

const pty = require('node-pty')
    , crypto = require('crypto')
    , bluebird = require('bluebird')
    , Docker = require('../lib/tools/docker')
    , docker = bluebird.promisifyAll(new Docker())

module.exports = function(io){
  io.of('/term').on('connection', async (socket) => {
    const user = socket.request.user;
    const userData = 'shelldata.' + crypto.createHash('sha1')
      .update(`${user.name}`).digest('hex')
    const name = 'tmp' + crypto.createHash('sha1').update(`${Date.now()}`).digest('hex');
    const dataCont = docker.getContainer(userData);
    let isFirstTime = '';
    if(!await dataCont.statsAsync().catch(() => null)){
      await docker.createContainerAsync({Image: 'busybox', name: userData, Volumes: {'/home/user':{}}});
      isFirstTime = 'cp -a /etc/skel/. /home/user; chown user.user /home/user/.?*;';
    }
    const args = {
      name,
      Image: 'minamo-internal/shell',
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      Tty: true,
      Cmd: [ '/bin/bash', '-c', `${isFirstTime} chown user.user /home/user; exec login -f user` ],
      HostConfig: { AutoRemove: true, VolumesFrom: [ userData ] },
      NetworkingConfig: { EndpointsConfig: { "shell": {} } }
    };
    const container = await docker.createContainerAsync(args);
    let term = pty.spawn('docker', ['start', '-ai', name], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      env: {
        HOME: process.env.HOME,
        SHELL: '/bin/bash',
        USER: process.env.USER,
        LANG: process.env.LANG
      }
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
}
