'use strict';

var express = require('express'),
	documentation = require('./documentation.js'),
	redis = require('redis'),
	rate = require('express-rate'),
	config = require('../../config/config'),
	mongoose = require('mongoose'),
	SimpleApiKey = mongoose.model('SimpleApiKey'),
	annotations = require('express-annotations'),
	Cacher = require("cacher"),
	utils = require('./utils'),
	CacherRedis  = require('cacher-redis');

module.exports = function(app) {
	var versions = [];
	var rateHandler;
	var cacher;
	var redisClient;

	utils.fixCacher(Cacher);

	if(config.redis) {
		// Setup Redis client for API Rate limiting
		redisClient = redis.createClient(config.redis.port, config.redis.host);
		redisClient.auth(config.redis.password);

		redisClient.on('ready', function() {
			console.log("Readis is ready.");
		});

		rateHandler = new rate.Redis.RedisRateHandler({client: redisClient});

		cacher = new Cacher(CacherRedis(redisClient));
  	} else {
  		// Fallback to In-Memory handler if Redis is not available
  		rateHandler = new rate.Memory.MemoryRateHandler();

  		// In-Memory Cache
  		cacher = new Cacher()
  	}

  	var apiKeyMiddleware = function(req, res, next) {
  		if(req.query.apikey) {
  			SimpleApiKey.findOne({apikey: req.query.apikey})
  			.populate('application')
  			.exec(function(err, apikey) {
  				req.apikey = apikey;
  				next();
  			});
  		} else {
  			next();
  		}
  	};

  	var rateMiddleware = function(req, res, next) {

  		var limit = 10000;

  		if(req.apikey)
  			limit = 50000;

  		var rm = rate.middleware({
  			handler: rateHandler,
  			limit: limit,
  			interval: 86400,
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
  				res.json(403, {error: 'Rate limit exceeded. Check headers for limit information.'});
  			},
  			getRouteKey: function(req) {
  				return "api";
  			},
  			getRemoteKey: function (req) {
  				var key = req.headers['x-client-ip'] || req.ip;
  				return key;
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

			impl.use(apiKeyMiddleware);
			impl.use(rateMiddleware);

			impl.route = function(method, path, metadata) {
				var args = Array.prototype.slice.call(arguments);

				if(metadata)
					impl.annotate(method+"-"+path, metadata);
				
				impl[method](path, args.slice(3));
			};

	 		require("./"+file)(impl, cacher);

	 		documentation(version, app, impl);
	 		
	 		app.use("/api/"+ version, impl);
		}
	});	

	app.get('/api/versions', function(req, res) {
 		res.json(versions);
	});
}