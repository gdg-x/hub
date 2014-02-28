'use strict';

var config = require('../config/config'),
	mongoose = require('mongoose'),
	Chapter = mongoose.model('Chapter'),
	moment = require('moment'),
	request = require('superagent'),
	async = require('async'),
	utils = require('../utils'),
	googleapis = require('googleapis');

module.exports = function(id, params, cb){
	async.series([
		function(acallback) {
			googleapis
				.discover('plus', 'v1')
				.execute(function(err, client) {
					Chapter.find({}, function(err, chapters) {
						
						var batch = client.newBatchRequest();

						for(var i = 0; i < chapters.length; i++) {
							var chapter = chapters[i];
							batch.add(client.plus.people.get({ userId: chapter._id, fields: 'id,circledByCount,plusOneCount' }).withApiKey(config.keys.google.simpleApiKey));
						}

						batch.execute(function(err, results) {
							console.log(results);
							async.each(results,
								function(item, callback) {

									if(item.plusOneCount) {
										utils.recordDailyMetric(item.id, "plusOneCount", item.plusOneCount);
									}

									if(item.circledByCount) {
										utils.recordDailyMetric(item.id, "circledByCount", item.circledByCount);
									}

									callback(null);
								},
								function(err) {
									acallback(err, "one");
								});
						});
					});
				});
		},
		function(acallback) {
			acallback(null, "two");
		}
	], function(err, results){
		cb();
	});
};