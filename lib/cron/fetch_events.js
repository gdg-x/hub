'use strict';

var cronJob = require('cron').CronJob,
	config = require('../config/config.js'),
	mongoose = require('mongoose'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	async = require('async'),
	devsite = require('../clients/devsite');

module.exports = new cronJob('0 */12 * * *', function(){
		async.series([
		    function(callback){
		        Chapter.find({}).exec(function(err, chapters) {
					async.each(chapters, function(chapter, chapterCallback) {
						devsite.fetchEventsForChapter(chapter._id, function(err, events) {
							async.each(events, function(event, eventsCallback) {
								event.save(function(err) {
									eventsCallback(err);
								});
							}, function(err) {
								chapterCallback(err);
							});
						});
					}, function(err) {
						callback(err, "done");
					});
				});
		    },
		    function(callback){

				var processTag = function(tag, tagCallback, err, events) {
					async.each(events, function(ev, evCallback) {
						var patt = /[0-9-]+/g;
						var result = patt.exec(ev.defaultEventUrl);
						Event.findOne({_id: result[0] }).exec(function(err, mev) {
							if(mev) {
								if(mev.tags.indexOf(tag) == -1) {
									mev.tags.push(tag);
									mev.save(function(err) {
										evCallback(err);
									});
								} else {
									evCallback(null);
								}
							} else {
								evCallback(null);
							}
						});
					}, function(err) {
						tagCallback(err);
					});
				};

				devsite.fetchTags(function(err, tagsObject) {

					var tags = [];
					
					for(var key in tagsObject) {
						if(tagsObject[key] != "gdg")
							tags.push(tagsObject[key]);
					};

					async.each(tags, function(tag, tagCallback) {
						devsite.fetchTaggedEvents(tag, processTag.bind(this, tag, tagCallback));
					}, function(err) {
						callback(err, 'two');
					})
				});
		    }
		], function() {
			// Alldone
		});
	}, function () {

	}
);