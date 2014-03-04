'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	redis = require('redis'),
	config = require('../../../config/config'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
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

	app.route("post", "/admin/tasks", { admin: true }, middleware.auth(), function(req, res) {
		risky.sendTask(req.body.task_type, req.body.params, function(id, type, time) {
			res.jsonp({msg: "ok", taskId: id, code: 200})
		}, null, true);
	});

	app.route("post", "/admin/tasks/cluster", { admin: true }, middleware.auth(), function(req, res) {
		res.jsonp(risky.getCluster());
	});

	app.route("post", "/admin/cache/flush", { admin: true }, middleware.auth(), function(req, res) {
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

	app.route("post", "/admin/prerender/flush", { admin: true }, middleware.auth(), function(req, res) {
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