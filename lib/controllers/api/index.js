'use strict';

var express = require('express'),
	documentation = require('./documentation.js'),
	redis = require('redis'),
	rate = require('express-rate'),
	config = require('../../config/config'),
	annotations = require('express-annotations');

module.exports = function(app) {
	var versions = [];
	var rateHandler;
	var redisClient;

	if(config.redis) {
		// Setup Redis client for API Rate limiting
		redisClient = redis.createClient(config.redis.port, config.redis.host);
		redisClient.auth(config.redis.password);

		redisClient.on('ready', function() {
			console.log("Readis is ready.");
		});

		rateHandler = new rate.Redis.RedisRateHandler({client: redisClient});
  	} else {
  		// Fallback to In-Memory handler if Redis is not available
  		rateHandler = new rate.Memory.MemoryRateHandler();
  	}

  	var rateMiddleware = function(req, res, next) {
  		console.log(req.route);
  		var rm = rate.middleware({
  			handler: rateHandler,
  			limit: 5,
  			interval: 200,
  			setHeadersHandler: function (req, res, rate, limit, resetTime) {
  				var remaining = limit - rate;

	            if (remaining < 0) {
	                remaining = 0;
	            }
  				res.setHeader('X-RateLimit-Limit', limit);
            	res.setHeader('X-RateLimit-Remaining', remaining);
            	res.setHeader('X-RateLimit-Reset', resetTime);
  			},
  			onLimitReached: function (req, res, rate, limit, resetTime, next) {
  				res.json(420, {error: 'Rate limit exceeded. Check headers for limit information.'});
  			},
  			getRouteKey: function(req) {
  				return "api";
  			}
  		});


  		rm(req, res, next);
  	};

	require("fs").readdirSync(__dirname + '/').forEach(function(file) {
		if (file.match(/.+\.js/g) == null) {
			var version = file;
	 		versions.push(version);

			var impl = express();
			annotations.extend(impl);

			impl.use(rateMiddleware);

			impl.route = function(method, path, metadata) {
				var args = Array.prototype.slice.call(arguments);

				if(metadata)
					impl.annotate(method+"-"+path, metadata);
				
				impl[method](path, args.slice(3));
			};

	 		require("./"+file)(impl);

	 		documentation(version, app, impl);
	 		
	 		app.use("/api/"+ version, impl);
		}
	});	

	app.get('/api/versions', function(req, res) {
 		res.json(versions);
	});
}