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
  cluster = require('cluster'),
  numCPUs = require('os').cpus().length,
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

function initWorker(worker) {
  var listeners;

  listeners = worker.process.listeners('exit')[0];
  var exit = listeners[Object.keys(listeners)[0]];

  listeners = worker.process.listeners('disconnect')[0];
  var disconnect = listeners[Object.keys(listeners)[0]];

  worker.process.removeListener('exit', exit);
  worker.process.once('exit', function(exitCode, signalCode) {
    if (worker.state !== 'disconnected') {
      disconnect();
    }
    exit(exitCode, signalCode);
  });
}

if (cluster.isMaster) {
  var i;
  // Fork workers.
  for (i = 0; i < numCPUs; i++) {
    setTimeout(function () {
      var worker = cluster.fork();
      initWorker(worker);
      console.log('Worker started, PID ' + worker.process.pid);
    }, (i + 1) * 5000); // jshint ignore:line
  }

  cluster.on('exit', function (deadWorker, code, signal) {
    // Restart the worker
    var worker = cluster.fork();
    initWorker(worker);

    // Note the process IDs
    var newPID = worker.process.pid;
    var oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker ' + oldPID + ' died. Code: ' + code + ', Signal: ' + signal);
    console.log('worker ' + newPID + ' born.');
  });
} else {
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

  var risky = require('./lib/risky');

  // Passport Configuration
  require('./lib/config/passport')();

  if (config.env === 'production' && config.redis) {
    var myId = 'workerId';
    if (cluster.isWorker) {
      myId = 'worker-' + cluster.worker.process.pid;
    }
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
    console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
  });

  // Expose app
  exports = module.exports = app;
}
