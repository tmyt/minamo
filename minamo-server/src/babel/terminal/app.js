$(function(){
  const term = new Terminal(80, 30);
  const socket = io('/term');
  term.open(document.getElementById('terminal'));
  term.on('data', d => socket.emit('data', d));
  term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
  socket.on('data', d => term.write(d));
  socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
  term.fit();
  if(typeof(isExported) !== 'undefined'){
    let timer = null;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => term.fit(), 100);
    });
    term.on('title', d => document.title = d);
    socket.on('exit', d => window.close());
  }
  // handle button click
  let openPopup = document.getElementById('open_popup');
  if(!openPopup){ return; }
  const popupWindowFeatures = {
    width: 800,
    height: 480,
    menubar: 'no',
    toolbar: 'no',
    location: 'no',
    directories: 'no',
    personalbar: 'no',
    status: 'no',
    resizable: 'yes',
    scrollbars: 'no',
  };
  const features = Object.keys(popupWindowFeatures).map(x => `${x}=${popupWindowFeatures[x]}`).join(',');
  openPopup.addEventListener('click', () => {
    if(document.getElementById('x-minamo-openterminal-extension')){
      let e = new CustomEvent('x-minamo-openterminal', {detail: { url: location.protocol + location.host + '/console/terminal_popup'}});
      window.dispatchEvent(e);
      return;
    }
    window.open('/console/terminal_popup', `terminal-${Date.now()}`, features);
  });
});
