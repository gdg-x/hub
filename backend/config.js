'use strict'
const nconf = require('nconf')

module.exports = nconf.argv().env().file({
  file: './.env.json'
})
