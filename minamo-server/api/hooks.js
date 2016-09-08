'use strict';

const path = require('path')
    , crypto = require('crypto')
    , fs = require('fs-extra')
    , appReq = require('app-require')
    , config = appReq('./config');

const hmac = (key, data) => {
  return crypto.createHmac('sha1', key).update(data).digest('hex');
};

module.exports = function(kvs){
  return function(req, res){
    let repo = req.params.repo;
    if(!repo.match(/^[a-z0-9-]+$/)){
     return res.sendStatus(400);
    }
    fs.readFile(path.join(config.repo_path, repo), (err, json) => {
      if(err) return res.sendStatus(400);
      if(req.query.key !== hmac(config.secret || 'minamo.io', repo)){
        return res.sendStatus(400);
      }
      let tools = appReq('./lib/tools');
      tools.build(repo);
      kvs.resetHost(`${repo}.${config.domain}`);
      return res.sendStatus(200);
    });
  };
};
