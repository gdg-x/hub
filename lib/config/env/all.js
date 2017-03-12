'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || process.env.NODEJS_PORT || 3000,
  hostname: process.env.NODEJS_IP || undefined,
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  sessionSecret: process.env.SESSION_SECRET
};
