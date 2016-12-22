(function(){
  loadjs([
    'https://fonts.googleapis.com/css?family=Open+Sans:300,400,700&.css',
    '/css/minamo.min.css'
  ])
  loadjs([
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js',
  ],{success: function(){
    loadjs('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js')
  }});
})()
