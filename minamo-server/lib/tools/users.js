'use strict';

const config = require('../../config')
    , userDb = new(require('../auth/userdb'))(config.userdb);

process.on('unhandledRejection', console.dir);

async function add(name){
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
}

async function del(name){
  if(!name){
    console.log('error: arguments required.');
    return;
  }
  try{
    if(!await userDb.findUser(name)){
      console.log(`User ${name} is not exists`);
    }else{
      const password = await userDb.removeUser(name);
      console.log(`User '${name}' removed.`);
    }
  }catch(e){
    console.log('Failed to remove user.');
  }
}

async function reset(name){
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
}

const args = process.argv.slice(2);
if(args.length < 1){
  console.log('error: arguments required.');
  process.exit(1);
}

switch(args[0]){
  case 'add':
    add.apply(this, args.slice(1));
    break;
  case 'del':
    del.apply(this, args.slice(1));
    break;
  case 'reset':
    reset.apply(this, args.slice(1));
    break;
  default:
    console.log(`error: command '${args[0]}' is not supported.`);
    process.exit(1);
}
