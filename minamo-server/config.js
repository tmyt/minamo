"use strict";

let path = require('path');

module.exports = {
    domain: 'minamo.io',
    repo_path: process.env.MINAMO_PORES_PATH || path.resolve('repos')
};
