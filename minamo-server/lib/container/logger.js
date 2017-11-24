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
            const log = JSON.parse(s);
            if(log.progressDetail){
              let logs = '';
              if(log.id) logs += `${log.id}: `;
              if(log.status) logs += `${log.status} `;
              if(log.progress) logs += `${log.progress}`;
              stream.write(`${logs}\n`);
            }else if(log.status){
              stream.write(`${log.status}\n`);
            }else{
              stream.write(log.stream || '');
            }
          });
        }else{
          str.pipe(stream);
        }
        str.on('end', () => {
          try{
            stream.close();
          }catch(e){
            // do nothing
          }
          resolve();
        });
      }
    });
  }
}

module.exports = Logger;
