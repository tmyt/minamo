'use strict';

const fs = require('fs');

class Logger {
  constructor(path){
    this.path = path;
  }
  emit(str, json){
    return new Promise(resolve => {
      if(typeof(str) === 'string'){
        fs.appendFile(this.path, `${str}\n`, resolve);
      }else{
        const stream = fs.createWriteStream(this.path, {flags: 'a'});
        if(json){
          str.on('data', s => {
            stream.write(JSON.parse(s).stream || '');
          });
        }else{
          str.pipe(stream);
        }
        str.on('end', () => {
          stream.close();
          resolve();
        });
      }
    });
  }
}

module.exports = Logger;
