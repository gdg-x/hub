'use strict';

var config = require('../config/config.js'),
	mongoose = require('mongoose'),
	request = require('superagent'),
	Chapter = mongoose.model('Chapter'),
	Tag = mongoose.model('Tag'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	async = require('async'),
	devsite = require('../clients/devsite');

require('superagent-retry')(request);

module.exports = function(id, params, cb){
		params = params || {};
		var month = params.month > 0 ? params.month -1 : moment().month() || moment().month();
		var year = params.year || moment().year(); 

		var lastDayOfMonth = moment().year(year).month(month).add('months', 1).date(10).seconds(0).minutes(0).hours(0).unix();
		var firstDayOfMonth = moment().year(year).month(month).date(1).subtract('days', 10).seconds(0).minutes(0).hours(0).unix();

		console.log("[task "+ id+"] fetching events (start: "+ firstDayOfMonth + ", end: "+ lastDayOfMonth);
		async.series([
		    function(callback){
		        Chapter.find({}).exec(function(err, chapters) {
					async.each(chapters, function(chapter, chapterCallback) {
						devsite.fetchEventsForChapter(firstDayOfMonth, lastDayOfMonth, chapter._id, function(err, events) {
							if(events) {

								request.get("https://developers.google.com/events/feed/json?group="+chapter._id+"&start="+firstDayOfMonth+"&end="+lastDayOfMonth)
								.retry(5).end(function(err, res) {

									if(err || !res) {
										console.log("error fetching events")
										chapterCallback(err);
									} else {

										if(events.length != res.body.length) {
											console.log("chapter "+ chapter.name);
											console.log("client says there are: "+ events.length +" events");
											console.log("devsite has "+ res.body.length + " events");
											console.log("EVENT COUNT MISSMATCH!!!");
										}

										async.each(events, function(event, eventsCallback) {

											var upsertData = event.toObject();
											delete upsertData._id;

											Event.update({_id: event._id}, upsertData, {upsert: true}, function(err) {
												eventsCallback(err);
											});
										}, function(err) {
											console.log("[task "+ id+"] saved "+ events.length + " events");
											chapterCallback(err);
										});
									}
								});
							} else {
								chapterCallback(null);
							}
						});
					}, function(err) {
						console.log("[task "+ id+"] fetched_events");
						callback(err, "done");
					});
				});
		    },
		    function(callback){
				console.log("[task "+ id+"] fetching tags for events");
				var processTag = function(tag, tagCallback, err, events) {
					events = events || [];
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
						if(tagsObject[key].id != "gdg")
							tags.push({
								id: tagsObject[key].id,
								title: key
							});
					};

					async.each(tags, function(tag, tagCallback) {
						Tag.findOne({ _id: tag.id }, function(err, stag) {
							if(!stag) {
								stag = new Tag({
									_id: tag.id,
									title: tag.title
								}).save(function(err, doc) {
									devsite.fetchTaggedEvents(tag.id, month, year, processTag.bind(this, tag.id, tagCallback));
								});
							} else {
								devsite.fetchTaggedEvents(tag.id, month, year, processTag.bind(this, tag.id, tagCallback));
							}
						})
					}, function(err) {
						console.log("[task "+ id+"] done fetching tags");
						callback(err, 'two');
					})
				});

		    }
		], function(err) {
			console.log("[task "+ id+"] done");
			if(err) console.log(err);
			// Alldone
			cb(err);
		});
	};