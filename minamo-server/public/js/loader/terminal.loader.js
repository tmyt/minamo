(function(){
  loadjs([
    '/js/loader/minamo.loader.js',
    '/components/xterm.js/dist/xterm.js',
    '/components/xterm.js/dist/xterm.css',
    'https://cdn.socket.io/socket.io-1.4.5.js'
  ], 'xterm');
  loadjs.ready('xterm', {success: function(){
    loadjs([
      '/components/xterm.js/dist/addons/fit/fit.js'
    ], 'assets');
  }});
  loadjs.ready(['jquery', 'assets'], {success: function(){$(function(){
    var term = new Terminal(80, 30);
    var socket = io('/term');
    term.open(document.getElementById('terminal'));
    term.on('data', d => socket.emit('data', d));
    term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
    socket.on('data', d => term.write(d));
    socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
    term.fit();
  })}});
})()
