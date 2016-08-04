var log = document.getElementById('log');
var socket = io();
socket.on('line', function(line){
  var span = document.createElement('span');
  span.innerHTML = line;
  log.appendChild(span.firstChild);
});
