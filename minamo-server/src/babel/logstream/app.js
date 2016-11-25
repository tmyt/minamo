const log = document.getElementById('log');
const socket = io('/log');
socket.on('line', function(line){
  // check scroll position
  const tail = log.scrollHeight <= log.scrollTop + log.clientHeight;
  // append element
  const span = document.createElement('span');
  span.innerHTML = line;
  log.appendChild(span.firstChild);
  // remove overflow log
  while(log.children.length > 5000){
    log.removeChild(log.children[0]);
  }
  // scroll if needed
  if(tail) log.scrollTop = log.scrollHeight;
});
