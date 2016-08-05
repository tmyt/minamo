var log = document.getElementById('log');
var socket = io();
socket.on('line', function(line){
  // check scroll position
  var tail = log.scrollHeight <= log.scrollTop + log.clientHeight;
  // append element
  var span = document.createElement('span');
  span.innerHTML = line;
  log.appendChild(span.firstChild);
  // scroll if needed
  if(tail) log.scrollTop = log.scrollHeight;
});
