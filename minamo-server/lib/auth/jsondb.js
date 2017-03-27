'use struct';

const bluebird = require('bluebird')
    , fs = bluebird.promisifyAll(require('fs'));

class JsonDB{
  constructor(path){
    this._dataPath = path;
    this._dataStore = {};
  }
  loadData(){
    return fs.readFileAsync(this._dataPath)
      .then(JSON.parse)
      .catch(() => []);
  }
  saveData(data){
    return Promise.resolve(JSON.stringify(data))
      .then(d => fs.writeFileAsync(this._dataPath, d));
  }
  match(d, where){
    if(!where) return true;
    const keys = Object.keys(where);
    for(let i = 0; i < keys.length; ++i){
      if(d[keys[i]] !== where[keys[i]]) return false;
    }
    return true;
  }
  select(where){
    return this.loadData()
      .then(d => d.filter(x => this.match(x, where)));
  }
  insert(object){
    return this.loadData()
      .then(d => d.concat([object]))
      .then(d => this.saveData(d));
  }
  update(object, where){
    return this.loadData()
      .then(d => {
        for(let i = 0; i < d.length; ++i){
          if(!this.match(d[i], where)) continue;
          d[i] = object;
        }
        return d;
      })
      .then(d => this.saveData(d));
  }
  delete(where){
    return this.loadData()
      .then(d => d.filter(x => !this.match(x, where)))
      .then(d => this.saveData(d));
  }
}

module.exports = JsonDB;
