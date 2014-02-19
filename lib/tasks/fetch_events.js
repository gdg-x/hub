'use strict';

var config = require('../config/config.js'),
	mongoose = require('mongoose'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	async = require('async'),
	devsite = require('../clients/devsite');

module.exports = function(id, params, cb){
		params = params || {};
		var month = params.month || moment().month();

		async.series([
		    function(callback){
		        Chapter.find({}).exec(function(err, chapters) {
					async.each(chapters, function(chapter, chapterCallback) {
						devsite.fetchEventsForChapter(month, chapter._id, function(err, events) {
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
						if(tagsObject[key].id != "gdg")
							tags.push(tagsObject[key].id);
					};

					async.each(tags, function(tag, tagCallback) {
						devsite.fetchTaggedEvents(tag, processTag.bind(this, tag, tagCallback));
					}, function(err) {
						callback(err, 'two');
					})
				});
		    }
		], function(err) {
			if(err) console.log(err);
			// Alldone
			cb();
		});
	};