'use strict';

let path = require('path');

module.exports = {
    proto: "https",
    domain: 'minamo.io',
    repo_path: process.env.MINAMO_REPOS_PATH || path.resolve('repos')
};
