'use strict';

const readline = require('readline')
    , a2h = require('ansi2html-extended')
    , spawn = require('child_process').spawn;

function tailf(path){
  let tail = spawn('tail', ['-f', '-n 300', path]);
  let rl = readline.createInterface({
    input: tail.stdout,
    output: tail.stdin
  });
  rl.kill = function(){ tail.kill(); }
  return rl;
}

function stylize(str){
  if(!str) return '<span class="ansi_console_snippet">&#8203;</span>';
  return a2h.fromString({wrapped: true}, str)
}

function getStyle(str){
  let re = /(\033\[(\d+)(;\d+)?m)/gm;
  let res;
  let state = {color:'', bold:'', italic: ''};
  while((res = re.exec(str)) != null){
    switch(res[2]){
      case '1':
        state.bold = true;
        break;
      case '22':
        state.bold = false;
        break;
      case '3':
        state.italic = true;
        break;
      case '23':
        state.italic = false;
        break;
      case undefined:
      case '0':
      case '39':
        state.color = '';
        break;
      case '30':
      case '31':
      case '32':
      case '33':
      case '34':
      case '35':
      case '36':
      case '37':
      case '90':
      case '91':
      case '92':
      case '93':
      case '94':
      case '95':
      case '96':
      case '97':
        state.color = res[2];
        if(res[3]) state.color += ';' + res[3];
        break;
    }
  }
  return state;
}

module.exports = function(server){
  const io = require('socket.io')(server)
  io.of('/log').on('connection', socket => {
    let tail = tailf('/tmp/minamo/build.log');
    let state = {color:'', bold:'', italic: ''};
    tail.on('line', line => {
      if(state.bold) line = "\u001b[1m" + line;
      if(state.italic) line = "\u001b[3m" + line;
      if(!!state.color) line = "\u001b[" + state.color + "m" + line;
      state = getStyle(line);
      socket.emit('line', stylize(line))
    });
    socket.on('disconnect', () => tail.kill());
  });
  return io;
}
