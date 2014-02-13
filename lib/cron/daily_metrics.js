'use strict';

var cronJob = require('cron').CronJob,
	config = require('../config/config.js'),
	mongoose = require('mongoose'),
	Chapter = mongoose.model('Chapter'),
	Metric = mongoose.model('Metric'),
	async = require('async'),
	googleapis = require('googleapis');

module.exports = new cronJob('0 8 * * *', function(){
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
								var set = {};
								set["values."+moment().isoWeekday()] = item.plusOneCount;
								Metric.update({
									chapter: item.id,
									timestamp: moment().isoWeekday(1).hours(0).minutes(0).seconds(0).milliseconds(0),
									type: "plusOneCount"
								}, {
									$set: set,
    								$inc: {num_samples: 1, total_samples: item.plusOneCount }
								},
								{
									upsert: true
								},
								function(err, numberAffected, raw) {
									
								});
							}

							if(item.circledByCount) {
								var set = {};
								set["values."+moment().isoWeekday()] = item.circledByCount;
								Metric.update({
									chapter: item.id,
									timestamp: moment().isoWeekday(1).hours(0).minutes(0).seconds(0).milliseconds(0),
									type: "circledByCount"
								}, {
									$set: set,
    								$inc: {num_samples: 1, total_samples: item.circledByCount }
								},
								{
									upsert: true
								},
								function(err, numberAffected, raw) {
									
								});
							}

							callback(null);
						},
						function(err) {

						});
				});
			});
		});
});