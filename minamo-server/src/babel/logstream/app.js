const log = document.getElementById('log');
const socket = io('/log');
const term = new Terminal(80, 30);
term.open(log);
term.fit();
socket.on('data', line => {
  term.write(line);
});
