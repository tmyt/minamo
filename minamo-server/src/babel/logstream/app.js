$(function(){
  const term = new Terminal(80, 30);
  term.open(document.getElementById('log'));
  term.fit();
  const socket = io('/log');
  socket.on('data', d => term.write(d));
});
