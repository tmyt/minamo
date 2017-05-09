'use strict';

const path = require('path')
    , fs = require('fs');

async function getFileProp(file){
  return {
    filename: path.basename(file),
    integrity: await integrity(file),
    mtime: (await mtime(file)).getTime(),
  };
}

function mtime(file){
  return new Promise(resolve => {
    fs.stat(file, (err, stat) => {
      resolve(stat.mtime);
    });
  });
}

function integrity(file){
  return new Promise(resolve => {
    const crypto = require('crypto');
    fs.readFile(file, (err, content) => {
      resolve('sha256-' + crypto.createHash('sha256').update(content).digest('base64'));
    });
  });
}

module.exports = getFileProp;
