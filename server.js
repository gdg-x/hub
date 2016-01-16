var express = require('express');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
/**
 * Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  console.log('Loading model...' + file.replace('.js', ''));
  require(modelsPath + '/' + file);
});

// Import static data
require('./lib/fixtures')();

var risky = require('./lib/risky');

// Passport Configuration
require('./lib/config/passport')();

if (config.env === 'production' && config.redis) {
  var myId = 'workerId';
  risky.connect({
    port: config.redis.port,
    host: config.redis.host,
    auth: config.redis.password,
    id: myId,
    scope: 'risky'
  });
}

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
  console.log('Express server listening on port %d in %s mode',
    config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
