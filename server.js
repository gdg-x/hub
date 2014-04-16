'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    cluster = require('cluster'),
    http = require('http'),
    numCPUs = require('os').cpus().length,
    mongoose = require('mongoose');
/**
 * Main application file
 */

if (cluster.isMaster) {

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
  	setTimeout(function() {
	    var worker = cluster.fork();
	    console.log('worker started, PID '+ worker.process.pid);
  	}, (i+1)*5000); 
  }

  cluster.on('exit', function(deadWorker, code, signal) {
    // Restart the worker
    var worker = cluster.fork();

    // Note the process IDs
    var newPID = worker.process.pid;
    var oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker '+oldPID+' died.');
    console.log('worker '+newPID+' born.');
  });

} else {
	// Default node environment to development
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';

	// Application Config
	var config = require('./lib/config/config');

	// Disable NewRelic for now.
	//var newrelic = require('newrelic');

	// Connect to database
	var db = mongoose.connect(config.mongo.uri, config.mongo.options);

	// Bootstrap models
	var modelsPath = path.join(__dirname, 'lib/models');
	fs.readdirSync(modelsPath).forEach(function (file) {
	  require(modelsPath + '/' + file);
	});

	require('./lib/fixtures')();

	var risky = require('./lib/risky');

	// Passport Configuration
	require('./lib/config/passport')();

	if(config.env == 'production') {
		var myId = process.env.OPENSHIFT_GEAR_UUID+"";
		if(cluster.isWorker) {
			myId = process.env.OPENSHIFT_GEAR_UUID + "-" + cluster.worker.process.pid;
		}
		risky.connect({
			port: config.redis.port,
			host: config.redis.host,
			auth: config.redis.password,
			id: myId,
			scope: 'risky'
		});
	}
	require('./lib/tasks')();

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
}