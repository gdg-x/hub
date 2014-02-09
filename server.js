'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');
/**
 * Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var newrelic = require('newrelic');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

// Passport Configuration
require('./lib/config/passport')();

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

require('./lib/cron')();

// Start server
app.listen(config.port, config.hostname, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;