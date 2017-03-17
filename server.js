'use strict';

var env = require('dotenv').config({path: process.env.NODE_ENV === 'production' ? '.env-prod' : '.env'});
if (env && !env.error) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(JSON.stringify(env));
  }
} else {
  console.error(JSON.stringify(env));
}

var express = require('express'),
  path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose');

/**
 * Main application file
 */
console.log2 = console.log;
console.log = function () {
  var args = Array.prototype.slice.call(arguments);

  if (args.length > 1) {
    args[0] = '[' + process.pid + '] ' + args[0];
    this.log2.apply(this, args);
  } else {
    this.log2('[' + process.pid + '] ' + args[0]);
  }
};

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options); // jshint ignore:line

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  console.log('Loading model...' + file.replace('.js', ''));
  require(modelsPath + '/' + file);
});

// Import static data
require('./lib/fixtures')();

// Passport Configuration
require('./lib/config/passport')();

// Initialize admin task handlers
require('./lib/tasks')();

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Initialize cron jobs
require('./lib/cron')();

// Start server
app.listen(config.port, config.hostname, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
