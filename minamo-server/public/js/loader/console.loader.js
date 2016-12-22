(function(){
  loadjs([
    '/js/loader/minamo.loader.js',
    '//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css'
  ])
  loadjs([
    'https://cdnjs.cloudflare.com/ajax/libs/react/15.3.2/react.min.js',
  ],{success:function(){
  loadjs([
    'https://cdnjs.cloudflare.com/ajax/libs/react/15.3.2/react-dom.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.30.3/react-bootstrap.min.js',
    'https://cdn.socket.io/socket.io-1.4.5.js',
    '//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js',
    '/api/config.js'
  ],{success: function(){
    loadjs('/js/console.js')
  }})}})
})()
