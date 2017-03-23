'use strict';

const bluebird = require('bluebird')
    , fs = bluebird.promisifyAll(require('fs'))
    , crypto = require('crypto');

const PasswordBase = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{};:,./<>?`~';

class JsonDB{
  constructor(path){
    this._dataPath = path;
    this._dataStore = {};
  }
  loadData(){
    return fs.readFileAsync(this._dataPath)
      .then(JSON.parse)
      .catch(() => ([]));
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
    this.loadData()
      .then(d => {
        for(let i = 0; i < d.length; ++i){
          if(!this.match(d[i], where)) continue;
          d = d.splice(i--, 1);
        }
        return d;
      })
      .then(d => this.saveData(d));
  }
}

class UserDB{
  constructor(path){
    this._db = new JsonDB(path);
  }
  makePassword(){
    let password = '';
    for(let i = 0; i < 9; ++i){
      password += PasswordBase[(Math.random() * PasswordBase.length) | 0];
    }
    return password;
  }
  hashPassword(s){
    return crypto.createHash('sha256').update(s).digest('hex');
  }
  async findUser(userid){
    return !!(await this._db.select({type: 'local', username: userid})).length;
  }
  async createUser(userid){
    if(await this.findUser(userid)) return null;
    const password = this.makePassword();
    await this._db.insert({
      type: 'local',
      username: userid,
      password: this.hashPassword(password),
      avatar: '/img/default.gif',
      role: 'user'
    });
    return password;
  }
  async removeUser(userid){
    if(!await this.findUser(userid)) return false;
    await this._db.delete({type: 'local', username: userid});
    return true;
  }
  async authenticate(userid, password){
    return (await this._db.select({
      type: 'local',
      username: userid,
      password: this.hashPassword(password)
    }))[0];
  }
  async authenticateWithSocialId(provider, id){
    const username = (this._db.select({
      type: 'social', provider, id
    })).map(x => x.relative)[0];
    if(!username) return null;
    return (await this._db.select({
      type: 'local', username
    }))[0];
  }
  async authenticateWithFido2(id){
    const username = (this._db.select({
      type: 'fido2', id
    })).map(x => x.relative)[0];
    if(!username) return null;
    return (await this._db.select({
      type: 'local', username
    }))[0];
  }
  async getPublicKeyForId(id){
    return (await this._db.select({
      type: 'fido2', id
    })).map(d => d.key)[0];
  }
  async updateCredential(userid, password, newPassword){
    const user = (await this._db.select({
      type: 'local',
      username: userid,
      password: this.hashPassword(password)
    }))[0];
    if(!user) return false;
    user.password = this.hashPassword(newPassword);
    await this._db.update(user, {
      type: 'local',
      username: userid,
      password: this.hashPassword(password)
    });
    return true;
  }
  async addSocialId(userid, provider, id){
    const socialId = (await this._db.select({
      type: 'social', provider, id
    }))[0];
    if(!!socialId) return false;
    await this._db.insert({
      type: 'social',
      relative: userid,
      provider, id
    });
  }
  async removeSocialId(userid, provider, id){
    await this._db.delete({
      type: 'social', relative: userid, provider, id
    });
  }
  async addPublicKey(userid, publicKey, id){
    const socialId = (await this._db.select({
      type: 'fido2', id
    }))[0];
    if(!!socialId) return false;
    await this._db.insert({
      type: 'fido2',
      key: publicKey,
      relative: userid,
      id
    });
  }
  async removePublicKey(userid, id){
    await this._db.delete({
      type: 'fido2', username: userid, id
    });
  }
};

module.exports = UserDB;
