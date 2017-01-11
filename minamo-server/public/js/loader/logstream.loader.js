(function(){
  loadjs([
    '/js/loader/minamo.loader.js',
    '/components/xterm.js/dist/xterm.js',
    '/components/xterm.js/dist/xterm.css',
    'https://cdn.socket.io/socket.io-1.4.5.js'
  ], 'xterm');
  loadjs.ready('xterm', {success: function(){
    loadjs(['/components/xterm.js/dist/addons/fit/fit.js'
    ], 'assets');
  }})
  loadjs.ready('assets', {success: function(){
    loadjs('/js/logstream.js')
  }});
})()
