'use strict';

const express = require('express')
    , appReq = require('app-require')
    , config = appReq('./config')
    , userDb = new(appReq('./lib/auth/userdb'))(config.userdb);

class AdminApi {
  constructor(app){
    app.get('/users', this.listUsers);
    app.get('/users/exists', this.existsUser);
    app.post('/users/create', this.createUser);
    app.post('/users/delete', this.deleteUser);
    app.post('/users/reset_password', this.resetPassword);
    app.post('/users/role', this.updateRole);
    app.get('/admin/verify', this.verifyAdminCredentials);
  }

  async listUsers(req, res){
    const users = await userDb.getUsers();
    res.send(users);
  }

  async existsUser(req, res){
    const username = req.query.username;
    if(!username) return res.sendStatus(400);
    const exists = await userDb.findUser(username);
    res.sendStatus(exists ? 200 : 404);
  }

  async createUser(req, res){
    const username = req.body.username;
    if(!username) return res.sendStatus(400);
    if(await userDb.findUser(username)) return res.sendStatus(400);
    const password = await userDb.createUser(username);
    res.send(password);
  }

  async deleteUser(req, res){
    const username = req.body.username;
    if(!username) return res.sendStatus(400);
    if(username === req.user.username){
      return res.status(500).send('Could not remove yourself');
    }
    const ret = await userDb.removeUser(username);
    res.sendStatus(ret ? 200 : 500);
  }

  async resetPassword(req, res){
    const username = req.body.username;
    if(!username) return res.sendStatus(400);
    const password = await userDb.resetCredential(username);
    res.send(password);
  }

  async updateRole(req, res){
    const username = req.body.username;
    const role = req.body.role;
    if(!username || !role) return res.sendStatus(400);
    await userDb.updateRole(username, role);
    res.send(200);
  }

  verifyAdminCredentials(req, res){
    res.send({isAuthenticated: req.isAuthenticated() && req.user.role === 'admin' ? 1 : 0});
  }
}

module.exports = function(){
  const admin = express.Router();
  new AdminApi(admin);
  return admin;
};
