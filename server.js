'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    cluster = require('cluster'),
    http = require('http'),
    nodemailer = require('nodemailer'),
    numCPUs = require('os').cpus().length,
    mongoose = require('mongoose');
/**
 * Main application file
 */
console.log2 = console.log;
console.log = function(){
	var args = Array.prototype.slice.call(arguments);

	if(args.length > 1) {
		args[0] = "["+process.pid+"] "+args[0];
		this.log2.apply(this, args);
	} else {
		this.log2("["+process.pid+"] "+args[0]);
	}
};

if (cluster.isMaster) {

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
  	setTimeout(function() {
	    var worker = cluster.fork();
	    console.log('worker started, PID '+ worker.process.pid);
  	}, (i+1)*5000); 
  }

  cluster.on('disconnect', function(deadWorker) {
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

	process.on('uncaughtException', function(err) {
	  if(config.mail && config.mail.error_recipient) {
	  	console.log("Mailing error report.");
	  	var transport = nodemailer.createTransport(config.mail.transport, {});
	  	transport.sendMail({
	  		from: config.mail.sender,
	  		to: config.mail.error_recipient,
	  		subject: "Worker "+ process.pid + " crashed",
	  		generateTextFromHTML: true,
	  		html: "One of the workers of the Hub just crashed. Please check this Stacktrace and take action if necessary:<br/><br/>" + JSON.stringify(err.stack).split("\\n").join("<br />")
	  	})
	  }

	  try {
        // Ten minutes to let other connections finish:
        var killTimer = setTimeout(function() {
          process.exit(1);
        }, 60000);
        killTimer.unref(); // Don't stay up just for the timer
        cluster.worker.disconnect(); // Stop taking new requests
      } catch (err2) {
        console.log("Error handling error!: " + err2);
      }
	});


	// Disable NewRelic for now.
	//var newrelic = require('newrelic');

	// Connect to database
	var db = mongoose.connect(config.mongo.uri, config.mongo.options);

	// Bootstrap models
	var modelsPath = path.join(__dirname, 'lib/models');
	fs.readdirSync(modelsPath).forEach(function (file) {
	  console.log("Loading model..."+ file.replace(".js",""));
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