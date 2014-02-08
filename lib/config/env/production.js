'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.OPENSHIFT_MONGODB_DB_URL ||
         'mongodb://localhost/gdgx-hub-prod'
  },
  redis: {
  	host: process.env.OPENSHIFT_REDIS_DB_HOST,
  	port: process.env.OPENSHIFT_REDIS_DB_PORT,
  	password: process.env.OPENSHIFT_REDIS_DB_PASSWORD
  }
};