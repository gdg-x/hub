'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.MONGODB_DB_URL
  },
  mail: {
    sender: 'GDG[x] Hub <hub@gdgx.io>',
    transport: 'Direct',
    error_recipient: process.env.ADMIN_EMAIL // jshint ignore:line
  },
  redis: {
  	host: process.env.REDIS_DB_HOST,
  	port: process.env.REDIS_DB_PORT,
  	password: process.env.REDIS_DB_PASSWORD
  }
};
