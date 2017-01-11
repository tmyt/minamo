$(function(){
  const term = new Terminal(80, 30);
  const socket = io('/term');
  term.open(document.getElementById('terminal'));
  term.on('data', d => socket.emit('data', d));
  term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
  socket.on('data', d => term.write(d));
  socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
  term.fit();
});
