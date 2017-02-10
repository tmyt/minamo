function extension(){
  if(typeof(browser) === 'object') return browser;
  if(typeof(chrome) === 'object') return chrome;
}

function listen(){
  window.addEventListener('x-minamo-openterminal', function(e){
    extension().runtime.sendMessage({url: e.detail.url});
  });
}

function hook(){
  var el = document.createElement('div');
  el.id = 'x-minamo-openterminal-extension';
  el.style.display = 'none';
  document.body.appendChild(el);
}

listen();
hook();
