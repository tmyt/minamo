'use strict';

const JsonDB = require('./jsondb')
    , crypto = require('crypto');

const PasswordBase = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{};:,./<>?`~';

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
  async getUsers(){
    return (await this._db.select({type: 'local'}))
      .map(x => ({username: x.username, role: x.role}));
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
    await this._db.delete({relative: userid});
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
    const username = (await this._db.select({
      type: 'social', provider, id
    })).map(x => x.relative)[0];
    if(!username) return null;
    return (await this._db.select({
      type: 'local', username
    }))[0];
  }
  async authenticateWithFido2(id){
    const username = (await this._db.select({
      type: 'fido2', id
    })).map(x => x.relative)[0];
    if(!username) return null;
    return (await this._db.select({
      type: 'local', username
    }))[0];
  }
  async getConnectedSocialIds(userid){
    return (await this._db.select({
      type: 'social',
      relative: userid
    })).reduce((p,c) => ((p[c.provider] = c.id), p), {});
  }
  async getPublicKeyForId(id){
    return (await this._db.select({
      type: 'fido2', id
    })).map(d => d.key)[0];
  }
  async updateCredential(userid, password, newPassword){
    const where = {
      type: 'local',
      username: userid,
    };
    const user = (await this._db.select(where))[0];
    if(!user) return false;
    user.password = this.hashPassword(newPassword);
    await this._db.update(user, where);
    return true;
  }
  async updateAvatar(userid, avatar){
    const where = {
      type: 'local',
      username: userid,
    };
    const user = (await this._db.select(where))[0];
    if(!user) return false;
    user.avatar = avatar;
    await this._db.update(user, where);
    return true;
  }
  async resetCredential(userid){
    const where = {
      type: 'local',
      username: userid,
    };
    const user = (await this._db.select(where))[0];
    if(!user) return null;
    const password = this.makePassword();
    user.password = this.hashPassword(password);
    await this._db.update(user, where);
    return password;
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
    return true;
  }
  async removeSocialId(userid, provider, id){
    await this._db.delete({
      type: 'social', relative: userid, provider, id
    });
    return true;
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
    return true;
  }
  async removePublicKey(userid, id){
    await this._db.delete({
      type: 'fido2', username: userid, id
    });
    return true;
  }
};

module.exports = UserDB;
