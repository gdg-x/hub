'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	moment = require('moment'),
	async = require('async'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	app.route("get", "/events", {}, utils.getModel('Event', {
		end: { "$gt": new Date() }
	}));

	app.route("get", "/events/stats", {}, cacher.cache('hours', 2), function(req, res) {
		async.parallel([
		    function(callback){
		    	// Count Tags
		    	Event.aggregate([
				    { $match: { end: { "$gt": new Date() } /* Query can go here, if you want to filter results. */ } } 
				  , { $project: { tags: 1 } } /* select the tokens field as something we want to "send" to the next command in the chain */
				  , { $unwind: '$tags' } /* this converts arrays into unique documents for counting */
				  , { $group: { /* execute 'grouping' */
				          _id: '$tags' /* using the 'token' value as the _id */
				        , count: { $sum: 1 } /* create a sum value */
				      }
				    }
				], function(err, tags) {
				  var tagStats = {};
				  for(var i = 0; i < tags.length; i++) {
				  	tagStats[tags[i]._id] = tags[i].count;
				  }
				  callback(err, tagStats);
				});
		    },
		    function(callback){
		    	// Count Tags
		    	Event.aggregate([
				    { $match: { /* Query can go here, if you want to filter results. */ } } 
				  , { $project: { tags: 1 } } /* select the tokens field as something we want to "send" to the next command in the chain */
				  , { $unwind: '$tags' } /* this converts arrays into unique documents for counting */
				  , { $group: { /* execute 'grouping' */
				          _id: '$tags' /* using the 'token' value as the _id */
				        , count: { $sum: 1 } /* create a sum value */
				      }
				    }
				], function(err, tags) {
				  var tagStats = {};
				  for(var i = 0; i < tags.length; i++) {
				  	tagStats[tags[i]._id] = tags[i].count;
				  }
				  callback(err, tagStats);
				});
		    },
		    function(callback){
		    	// Count Participating Chapters upcoming
		    	Event.aggregate([
				    { $match: { end: { "$gt": new Date() } /* Query can go here, if you want to filter results. */ } } 
				  , { $group: { /* execute 'grouping' */
				          _id: '$chapter' /* using the 'token' value as the _id */
				        , count: { $sum: 1 } /* create a sum value */
				      }
				    }
				], function(err, tags) {
				  callback(err, tags.length);
				});
		    },
		    function(callback){
		    	// Count upcoming
		    	Event.count({
		    		end: { "$gt": new Date() }
		    	}, function(err, count) {
		    		callback(err, count);
		    	});
		    },
		    function(callback){
		    	// Count past
		    	Event.count({
		    		end: { "$lt": new Date() }
		    	}, function(err, count) {
		    		callback(err, count);
		    	});
		    }
		], function(err, results) {
			res.jsonp({
				upcoming_top_tags: results[0],
				alltime_top_tags: results[1],
				upcoming_groups: results[2],
				total_events: results[3] + results[4],
				upcoming_events: results[3],
				past_events: results[4]
			});
		});
	});

	app.route("get", "/events/past", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		end: { "$lt": new Date() }
	}));

	app.route("get", "/events/:eventId", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		_id: "eventId"
	}));

	app.route("get", "/events/tag/:tag", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		tags: "tag"
	}));

	app.route("get", "/chapter/:chapterId/events", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		end: { "$gt": new Date() }
	}));

	app.route("get", "/chapter/:chapterId/events/past", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		end: { "$lt": new Date() }
	}));

	app.route("get", "/chapter/:chapterId/events/tag/:tag", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		tags: "tag"
	}));

	app.route("get", "/chapter/:chapterId/events/stats", {}, cacher.cache('hours', 2), function(req, res) {

		Event.aggregate([
		    { $match: { chapter: req.params.chapterId /* Query can go here, if you want to filter results. */ } } 
		  , { $project: { tags: 1 } } /* select the tokens field as something we want to "send" to the next command in the chain */
		  , { $unwind: '$tags' } /* this converts arrays into unique documents for counting */
		  , { $group: { /* execute 'grouping' */
		          _id: '$tags' /* using the 'token' value as the _id */
		        , count: { $sum: 1 } /* create a sum value */
		      }
		    }
		], function(err, tags) {
		  res.jsonp(tags);
		});
	});
}
