'use strict';

let path = require('path');

module.exports = {
    proto: "http",
    domain: 'minamo.io',
    repo_path: process.env.MINAMO_PORES_PATH || path.resolve('repos')
};
