"use strict";

let path = require('path');

module.exports = {
    repo_path: process.env.MINAMO_PORES_PATH || path.resolve('repos')
};
