function extension(){
  if(typeof(browser) === 'object') return browser;
  if(typeof(chrome) === 'object') return chrome;
}

function openTerminal(url){
  extension().windows.create({
    url: url,
    type: 'popup',
    width: 800,
    height: 480,
  });
}

extension().runtime.onMessage.addListener(function(e, sender, sendResponse){
  openTerminal(e.url);
});

extension().browserAction.onClicked.addListener(() => {
  extension().storage.local.get("default_uri", value => {
    const uri = value.default_uri;
    if(!uri){
      extension().windows.create({
        url: extension().extension.getURL("options.html"),
        type: 'popup',
        width: 320,
        height: 480,
      });
    }else{
      openTerminal(uri);
    }
  });
});
