'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
         'mongodb://mongodb-mongo-db-1gu7/hub-prod'
  },
  mail: {
    sender: 'GDG[x] Hub <hub@gdgx.io>',
    transport: 'Direct',
    error_recipient: 'splaktar@gmail.com' // jshint ignore:line
  },
  redis: {
  	host: process.env.OPENSHIFT_REDIS_DB_HOST || '104.197.57.245',
  	port: process.env.OPENSHIFT_REDIS_DB_PORT || '6379',
  	password: process.env.OPENSHIFT_REDIS_DB_PASSWORD || undefined
  }
};
