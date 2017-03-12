'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: process.env.MONGODB_DB_URL
  },
  mail: {
    sender: 'GDG[x] Hub - Dev <hub@gdgx.io>',
    transport: 'Direct',
    error_recipient: undefined // jshint ignore:line
  }
};
