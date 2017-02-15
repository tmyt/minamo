'use strict';

const path = require('path');

module.exports = {
  proto: "https",
  domain: 'minamo.io',
  repo_path: process.env.MINAMO_REPOS_PATH || path.resolve('repos'),
  http_port: 3000,
  git_port: 7000,
  redis_port: 16379,

  // GitHub appid and trusted users
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_TRUSTED_USERS: (process.env.GITHUB_TRUSTED_USERS || '').split(','),

  // Twitter appid and trusted users
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY || '',
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET || '',
  TWITTER_TRUSTED_USERS: (process.env.TWITTER_TRUSTED_USERS || '').split(','),

  // Local password authentication
  LOCAL_USERS: (process.env.LOCAL_USERS || '').split(',').map(s => s.split(':'))
    .reduce((p, c) => ((p[c[0]] = c[1]), p), {})
};
