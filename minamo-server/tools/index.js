"use strict";

let path = require('path');
let exec = require('child_process').exec;

class Tools{

    build(repo){
        exec(path.join(__dirname, 'build.sh') + ' ' + repo);
    }

    terminate(repo){
        exec(path.join(__dirname, 'terminate.sh') + ' ' + repo);
    }

}

module.exports = new Tools();
