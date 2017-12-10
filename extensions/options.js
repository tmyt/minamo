(function(){
  const extension = () => {
    if(typeof(chrome) === 'object') return chrome;
    if(typeof(browser) === 'object') return browser;
  };
  const g = id => document.getElementById(id);
  g('save').addEventListener('click', () => {
    extension().storage.local.set({
      'default_uri': g('default_uri').value,
    }, () => {
      window.alert('done');
    });
  });
  extension().storage.local.get('default_uri', value => {
    g('default_uri').value = value.default_uri || '';
  });
})();