'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  hostname: undefined,
  mongo: {
    options: {
      db: {
        safe: true
      },
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }
  },
  sessionSecret: process.env.SESSION_SECRET
};
