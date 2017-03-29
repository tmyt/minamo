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
  var el = document.createElement('meta');
  el.name = 'mo:extension-available';
  el.content = '1';
  document.head.appendChild(el);
}

listen();
hook();
