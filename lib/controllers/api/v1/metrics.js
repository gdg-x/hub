'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Metric = mongoose.model('DailyMetric'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	app.route("get", "/metrics", {}, cacher.cache('hours', 2), utils.getModel('Chapter'));
	
	app.route("get", "/metrics/:metricType/:chapterId", {}, cacher.cache('hours', 2), utils.getModel('Metric', {
		type: "metricType",
		chapter: "chapterId"
	}));

	app.route("get", "/metrics/:metricType/:chapterId/now", {}, cacher.cache('hours', 2), utils.getModel('Metric', {
		type: "metricType",
		chapter: "chapterId",
		timestamp: moment().isoWeekday(1).hours(0).minutes(0).seconds(0).milliseconds(0)
	}));

	app.route("get", "/metrics/:metricType/:chapterId/last", {}, cacher.cache('hours', 2), utils.getModel('Metric', {
		type: "metricType",
		chapter: "chapterId",
		timestamp: moment().isoWeekday(1).hours(0).minutes(0).seconds(0).milliseconds(0).subtract('week', 1)
	}));
}
