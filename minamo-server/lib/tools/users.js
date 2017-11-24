'use strict';

const config = require('../../config')
    , userDb = new(require('../auth/userdb'))(config.userdb);

process.on('unhandledRejection', console.dir);

const cmds = {};

cmds.add = async function(name){
  if(!name){
    console.log('error: arguments required.');
    return;
  }
  try{
    if(await userDb.findUser(name)){
      console.log(`User ${name} is already exists`);
    }else{
      const password = await userDb.createUser(name);
      console.log(`User '${name}' created.`);
      console.log(`Default password is \u001b[1m${password}\u001b[0m`);
    }
  }catch(e){
    console.log('Failed to create user.');
  }
};
cmds.del = async function(name){
  if(!name){
    console.log('error: arguments required.');
    return;
  }
  try{
    if(!await userDb.findUser(name)){
      console.log(`User ${name} is not exists`);
    }else{
      await userDb.removeUser(name);
      console.log(`User '${name}' removed.`);
    }
  }catch(e){
    console.log('Failed to remove user.');
  }
};
cmds.reset = async function(name){
  if(!name){
    console.log('error: arguments required.');
    return;
  }
  try{
    if(!await userDb.findUser(name)){
      console.log(`User ${name} is not exists`);
    }else{
      const password = await userDb.resetCredential(name);
      console.log(`New password is \u001b[1m${password}\u001b[0m`);
    }
  }catch(e){
    console.log('Failed to reset password.');
  }
};
cmds.role = async function(name, role){
  if(!name || !role){
    console.log('error: arguments required.');
    return;
  }
  if(role !== 'admin' && role !== 'user'){
    console.log('error: role must be \'admin\' or \'user\'.');
    return;
  }
  try{
    if(!await userDb.findUser(name)){
      console.log(`User ${name} is not exists`);
    }else{
      await userDb.updateRole(name, role);
      console.log('Role updated.');
    }
  }catch(e){
    console.log('Failed to update role.');
  }
};
// --
const args = process.argv.slice(2);
const cmd = args.shift();
switch(cmd){
  case 'add':
  case 'del':
  case 'reset':
  case 'role':
    cmds[cmd].apply(this, args);
    break;
  case undefined:
    console.log('error: arguments required.');
    process.exit(1);
    break;
  default:
    console.log(`error: command '${args[0]}' is not supported.`);
    process.exit(1);
    break;
}
