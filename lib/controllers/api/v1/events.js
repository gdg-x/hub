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

	app.route("get", "/events", {}, utils.getModel('Event', {}));

	app.route("get", "/events/past", {}, utils.getModel('Event', {
		end: { "$lt": new Date() }
	}));

	app.route("get", "/events/upcoming", {}, utils.getModel('Event', {
		end: { "$gt": new Date() }
	}));

	app.route("get", "/events/today", {}, utils.getModel('Event', {
		start: { "$gte": moment().hours(0).minutes(0).seconds(0).milliseconds(0), "$lt": moment().add('days',1).hours(0).minutes(0).seconds(0).milliseconds(0) }
	}));

	app.route("get", "/events/now", {}, utils.getModel('Event', {
		start: { "$gte": new Date() },
		end: { "$lt": new Date() }
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
				  , { $sort: { count: -1 } }
				  , { $limit: 10 }
				], function(err, tags) {
				  var tagStats = {};
				  if(tags) {
					  for(var i = 0; i < tags.length; i++) {
					  	tagStats[tags[i]._id] = tags[i].count;
					  }
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
				  , { $sort: { count: -1 } }
				  , { $limit: 10 }
				], function(err, tags) {
				  var tagStats = {};
				  if(tags) {
					  for(var i = 0; i < tags.length; i++) {
					  	tagStats[tags[i]._id] = tags[i].count;
					  }
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
				  callback(err, tags ? tags.length : 0);
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
		    },
		    function(callback){
		    	Event.aggregate([
				    { $match: {  /* Query can go here, if you want to filter results. */ } } 
				  , { $project: { 
				  	start: 1,
				  	end: 1,
				  	duration: { $subtract: ['$end','$start'] }
				  } } /* select the tokens field as something we want to "send" to the next command in the chain */
				  , { $group: { /* execute 'grouping' */
				          _id: 'total' /* using the 'token' value as the _id */
				        , count: { $sum: '$duration' } /* create a sum value */
				      }
				    }
				], function(err, total) {
					if(err) {
				  		callback(err, null);
					} else {
						callback(err, total.length > 0 ? total[0].count : 0);
					}
				});
		    },
		    function(callback){
		    	Event.aggregate([
				    { $match: { end: { "$gt": new Date() }  /* Query can go here, if you want to filter results. */ } } 
				  , { $project: { 
				  	start: 1,
				  	end: 1,
				  	duration: { $subtract: ['$end','$start'] }
				  } } /* select the tokens field as something we want to "send" to the next command in the chain */
				  , { $group: { /* execute 'grouping' */
				          _id: 'total' /* using the 'token' value as the _id */
				        , count: { $sum: '$duration' } /* create a sum value */
				      }
				    }
				], function(err, total) {
					if(err) {
				  		callback(err, null);
					} else {
						callback(err, total.length > 0 ? total[0].count : 0);
					}
				});
		    }
		], function(err, results) {
			console.log("done");
			console.log(results);
			if(err) {
				console.log(err);
				res.send(500, "Internal Server Error");
			} else {
				res.jsonp({
					upcoming_top_tags: results[0],
					alltime_top_tags: results[1],
					upcoming_groups: results[2],
					total_events_duration_ms: results[5],
					total_upcoming_events_duration_ms: results[6],
					total_events: results[3] + results[4],
					upcoming_events: results[3],
					past_events: results[4]
				});
			}
		});
	});

	app.route("get", "/events/past", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		end: { "$lt": new Date() }
	}));

	app.route("get", "/events/:eventId/near", {}, function(req, res) {
		Event.findOne({ _id: req.params.eventId }, function(err, evt) {
			if(evt.geo) {
				/*Event.find({ geo: { $nearSphere: [evt.geo.lng, evt.geo.lat]  } }, function(err, events) {
					console.log(err);
					if(events)
						res.jsonp(events);
					else 
						res.jsonp([]);
				});*/
				
				console.log(evt);
				mongoose.connection.db.executeDbCommand({
					geoNear : "events",  // the mongo collection
					near : [evt.geo.lng, evt.geo.lat] , // the geo point
					spherical : true,  // tell mongo the earth is round, so it calculates based on a spherical location system
				}, function(err, result) {
					if(err)
						console.error(err);
					res.jsonp(result)
				});
			} else {
				res.jsonp([]);
			}
		
		});
	});

	app.route("get", "/events/year/:year", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			start: {
				"$gte": moment().year(req.params.year).dayOfYear(0).hours(0).minutes(0).seconds(0).milliseconds(0),
			},
			end: {
				"$lt": moment().year(req.params.year).dayOfYear(0).add('years',1).subtract('days',1).hours(0).minutes(0).seconds(0).milliseconds(0)
			}
		})(req,res);
	});

	app.route("get", "/events/year/:year/:month", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			start: {
				"$gte": moment().year(req.params.year).month(req.params.month-1).date(1).hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
			},
			end: {
				"$lt": moment().year(req.params.year).month(req.params.month-1).date(1).add('months',1).hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
			}
		})(req,res);
	});

	app.route("get", "/events/:eventId", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		_id: "eventId"
	}, true));


	app.route("get", "/events/tag/:tag", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		tags: "tag"
	}));

	app.route("get", "/events/:start/:end", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			start: { "$gt": req.params.start },
			end: { "$lt": req.params.end }
		})(req,res);
	});

	app.route("get", "/chapters/:chapterId/events", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId"
	}));

	app.route("get", "/chapters/:chapterId/events/upcoming", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		start: { "$gt": new Date() }
	}));

	app.route("get", "/chapters/:chapterId/events/past", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		end: { "$lt": new Date() }
	}));

	app.route("get", "/chapters/:chapterId/events/month", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			chapter: "chapterId",
			start: { "$gt": moment().date(1).minutes(0).seconds(0).milliseconds(0) },
			end: { "$lt": moment().add('months', 1).date(0).minutes(0).seconds(0).milliseconds(0) }
		})(req,res);
	});

	app.route("get", "/chapters/:chapterId/events/month/:year/:month", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			chapter: "chapterId",
			start: { "$gt": moment().year(req.params.year).month(req.params.month).date(1).hours(0).minutes(0).seconds(0).milliseconds(0) },
			end: { "$lt": moment().year(req.params.year).month(req.params.month).add('months', 1).date(0).minutes(0).seconds(0).milliseconds(0) }
		})(req,res);
	});

	app.route("get", "/chapters/:chapterId/events/:start/:end", {}, cacher.cache('hours', 2), function(req, res) {
		utils.getModel('Event', {
			chapter: "chapterId",
			start: { "$gt": req.params.start },
			end: { "$lt": req.params.end }
		})(req,res);
	});

	app.route("get", "/chapters/:chapterId/events/past", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		end: { "$lt": new Date() }
	}));

	app.route("get", "/chapters/:chapterId/events/tag/:tag", {}, cacher.cache('hours', 2), utils.getModel('Event', {
		chapter: "chapterId",
		tags: "tag"
	}));

	app.route("get", "/chapters/:chapterId/events/stats", {}, cacher.cache('hours', 2), function(req, res) {

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
