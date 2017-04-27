'use strict';

const path = require('path');

const data_dir = process.env.MINAMO_DATA_PATH || path.resolve('data');

module.exports = {
  proto: process.env.MINAMO_EXTERNAL_PROTOCOL || 'https',
  domain: process.env.MINAMO_DOMAIN || 'minamo.io',
  repo_path: process.env.MINAMO_REPOS_PATH || path.resolve('repos'),
  http_port: (process.env.MINAMO_HTTP_PORT || 3000) | 0,
  git_port: (process.env.MINAMO_GIT_PORT || 7000) | 0,
  redis_port: (process.env.MINAMO_REDIS_PORT || 16379) | 0,
  data_dir: data_dir,
  userdb: process.env.MINAMO_USERDB_PATH || path.join(data_dir, 'userdb.json'),

  // GitHub appid and trusted users
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',

  // Twitter appid and trusted users
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY || '',
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET || '',
};
