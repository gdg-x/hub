'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	DailyMetric = mongoose.model('DailyMetric'),
	MonthlyMetric = mongoose.model('MonthlyMetric'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	async = require('async'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	app.route("get", "/metrics/types", {}, function(req, res) {

		async.series([
			function(callback){
				DailyMetric.aggregate([
				    { $match: {} }
				  , { $group: { /* execute 'grouping' */
				          _id: '$type' /* using the 'token' value as the _id */
				        , subjectTypes: { $addToSet: "$subjectType" },/* create a sum value */
				      }
				    }
				], function(err, items) {
					callback(err, items);
				});
			},
			function(callback){
				MonthlyMetric.aggregate([
				    { $match: {} }
				  , { $group: { /* execute 'grouping' */
				          _id: '$type' /* using the 'token' value as the _id */
				        , subjectTypes: { $addToSet: "$subjectType" },/* create a sum value */
				      }
				    }
				], function(err, items) {
					callback(err, items);
				});
			}
		],
		// optional callback
		function(err, results){
			res.jsonp({
				daily: results[0],
				monthly: results[1]
			});
		});

	});

	app.route("get", "/metrics/daily/:subject/:metric/:year/:month", {}, utils.getModel('DailyMetric', {
		subject: "subject",
		type: "metric",
		year: "year",
		month: "month"
	}, null, true));	
}
