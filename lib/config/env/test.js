'use strict';

module.exports = {
  env: 'test',
  mongo: {
    uri: process.env.MONGODB_DB_URL
  }
};
