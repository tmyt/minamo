(function(){
  loadjs([
    '/js/loader/minamo.loader.js',
    'https://cdn.socket.io/socket.io-1.4.5.js'
  ],{success: function(){
    loadjs('/js/logstream.js')
  }})
})()
