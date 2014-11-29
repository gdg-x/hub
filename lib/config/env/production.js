'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
         'mongodb://localhost/gdgx-hub-prod'
  },
  mail: {
    sender: "GDG[x] Hub <hub@gdgx.io>",
    transport: "Direct",
    error_recipient: "maui@gdgac.org"
  },
  redis: {
  	host: process.env.OPENSHIFT_REDIS_DB_HOST,
  	port: process.env.OPENSHIFT_REDIS_DB_PORT,
  	password: process.env.OPENSHIFT_REDIS_DB_PASSWORD
  }
};