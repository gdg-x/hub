'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	async = require('async'),
	middleware = require('../../../middleware'),
	risky = require('../../../risky'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {
	app.route("post", "/admin/tasks", { admin: true }, middleware.auth(), function(req, res) {
		risky.sendTask(req.body.task_type, req.body.params, function(id, type, time) {
			res.jsonp({msg: "ok", taskId: id, code: 200})
		}, null, true);
	});

	app.route("get", "/admin/tasks/cluster", { admin: true }, middleware.auth(), function(req, res) {
		res.jsonp(risky.getCluster());
	});
};