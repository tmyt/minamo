function extension(){
  if(typeof(browser) === 'object') return browser;
  if(typeof(chrome) === 'object') return chrome;
}

function openTerminal(url){
  extension().windows.create({
    url: url,
    type: 'panel',
    width: 800,
    height: 480
  });
}

extension().runtime.onMessage.addListener(function(e, sender, sendResponse){
  openTerminal(e.url);
});

extension().browserAction.onClicked.addListener(() => {
  openTerminal('https://minamo.io/console/terminal_popup');
});
