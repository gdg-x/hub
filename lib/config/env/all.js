'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
  hostname: process.env.OPENSHIFT_NODEJS_IP || undefined,
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  sessionSecret: "e457jhe57hg45zth4htxdxKU&$FVrekrrj"
};
