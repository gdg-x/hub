'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	redis = require('redis'),
	config = require('../../../config/config'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	DailyMetric = mongoose.model('DailyMetric'),
	moment = require('moment'),
	async = require('async'),
	middleware = require('../../../middleware'),
	risky = require('../../../risky'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	var redisClient = null;;

	if(config.redis) {

		// Setup Redis client for API Rate limiting
		redisClient = redis.createClient(config.redis.port, config.redis.host);
		redisClient.auth(config.redis.password);

		redisClient.on('ready', function() {});
  	}

	app.route("post", "/admin/tasks", { }, middleware.auth({ roles: [ "admin" ] }), function(req, res) {
		risky.sendTask(req.body.task_type, req.body.params, function(id, type, time) {
			res.jsonp({msg: "ok", taskId: id, code: 200})
		}, null, true);
	});

	app.route("post", "/admin/tasks/cluster", { roles: [ "admin" ] }, middleware.auth({ roles: [ "admin" ] }), function(req, res) {
		res.jsonp(risky.getCluster());
	});

	app.route("post", "/admin/metrics/fix", { roles: [ "admin" ] }, middleware.auth({ roles: [ "admin" ] }), function(req, res) {
		
		DailyMetric.find({}, function(err, metrics) {
			for(var i = 0; i < metrics.length; i++) {
				var metric = metrics[i];

				var daysInMonth = moment(metric.year+"-"+metric.month, "YYYY-M").daysInMonth();
				for(var j = 1; j <= daysInMonth; j++) {
					var date = moment(metric.year+"-"+metric.month+"-"+j, "YYYY-M-D");

					if(date.isBefore(moment().subtract('days', 1))) {
						if(metric.values[j+""] == 0) {

							if((j-1 > 0 && metric.values[(j-1)+""] != 0) && (j+1 < daysInMonth && metric.values[(j+1)+""] != 0)) {
								metric.values[j+""] = (metric.values[(j-1)+""] + metric.values[(j+1)+""])/2;
							} else if((j-1 > 0 && metric.values[(j-1)+""] != 0) && (j+1 < daysInMonth && metric.values[(j+1)+""] == 0)) {
								metric.values[j+""] = metric.values[(j-1)+""];
							} else if((j+1 < daysInMonth && metric.values[(j+1)+""] != 0) && (j-1 > 0 && metric.values[(j-1)+""] == 0)) {
								metric.values[j+""] = metric.values[(j+1)+""];
							} else if(j == 1 && (j+1 < daysInMonth && metric.values[(j+1)+""] != 0)) {
								metric.values[j+""] = metric.values[(j+1)+""];
							}
						}
					}
				}
				metric.save();
			}
		});

		res.jsonp({ message: "ok"});
	});

	app.route("post", "/admin/cache/flush", { roles: [ "admin" ] }, middleware.auth({ roles: [ "admin" ] }), function(req, res) {
		if(redisClient) {
			redisClient.keys("cacher:*", function(err, replies) {
				if(replies.length == 0) {
					res.jsonp({msg:"nothing to flush", code: 404});
				} else {
					redisClient.del(replies, function(err) {
						if(err) {
							res.jsonp({msg:"flush failed", code: 500});
						} else {
							res.jsonp({msg:"flushed express cache", count: replies.length, code: 200});
						}
					})
				}
			});
		} else {
			res.jsonp({msg:"not connected to redis", code: 500});
		}
	});

	app.route("post", "/admin/prerender/flush", { roles: [ "admin" ] }, middleware.auth({ roles: [ "admin" ] }), function(req, res) {
		if(redisClient) {
			redisClient.keys("seo:*", function(err, replies) {
				if(replies.length == 0) {
					res.jsonp({msg:"nothing to flush", code: 404});
				} else {
					redisClient.del(replies, function(err) {
						if(err) {
							res.jsonp({msg:"flush failed", code: 500});
						} else {
							res.jsonp({msg:"flushed seo cache", count: replies.length, code: 200});
						}
					})
				}
			});
		} else {
			res.jsonp({msg:"not connected to redis", code: 500});
		}
	});
};