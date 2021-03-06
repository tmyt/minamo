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
    const repo = req.params.repo;
    if(!repo.match(/^[a-z][a-z0-9-]*[a-z0-9]$/)){
      return res.sendStatus(400);
    }
    fs.readFile(path.join(config.repo_path, repo), async (err) => {
      if(err) return res.sendStatus(400);
      if(req.query.key !== hmac(config.secret || 'minamo.cloud', repo)){
        return res.sendStatus(400);
      }
      const container = appReq('./lib/container');
      await container.build(repo);
      kvs.resetHost(`${repo}.${config.domain}`);
      await container.removeStaging(repo);
      return res.sendStatus(200);
    });
  };
};
