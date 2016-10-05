'use strict';

const fs = require('fs')
    , path = require('path');

function staticPugHandler(views){
  return function(req, res, next){
    let pug = req.baseUrl + req.path;

    if(pug.endsWith('/')) { pug += 'index' }
    if(path.basename(pug)[0] === '_') return next();

    fs.stat(path.join(views, pug + '.pug'), function(err, st){
      if(err) return next();
      let sid = encodeURIComponent(req.cookies['connect.sid'] || '');
      res.render(pug.substr(1), {profile: req.user, ios_url: '/console?_token=' + sid});
    });
  }
}

module.exports = staticPugHandler;
