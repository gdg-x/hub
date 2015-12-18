'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://localhost/gdgx-hub-dev'
  },
  mail: {
    sender: 'GDG[x] Hub - Dev <hub@gdgx.io>',
    transport: 'Direct',
    error_recipient: undefined // jshint ignore:line
  }
};
