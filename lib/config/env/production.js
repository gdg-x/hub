'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
         'mongodb://104.154.43.56/gdgx-hub-prod'
  },
  mail: {
    sender: "GDG[x] Hub <hub@gdgx.io>",
    transport: "Direct",
    error_recipient: "splaktar@gmail.com"
  },
  redis: {
  	host: process.env.OPENSHIFT_REDIS_DB_HOST || '130.211.142.195',
  	port: process.env.OPENSHIFT_REDIS_DB_PORT || '6379',
  	password: process.env.OPENSHIFT_REDIS_DB_PASSWORD || ''
  },
  hostname: process.env.OPENSHIFT_NODEJS_IP || "23.236.52.216"
};
