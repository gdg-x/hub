'use strict';

var mongoose = require('mongoose'),
	request = require('superagent'),
	moment = require('moment'),
	cheerio = require('cheerio'),
	config = require('../config/config'),
	TimeQueue = require('timequeue'),
	async = require('async'),
	geocoder = require('node-geocoder').getGeocoder("google", "https", { apiKey: config.keys.google.simpleApiKey }),
	Chapter = mongoose.model('Chapter'),
	Country = mongoose.model('Country'),
	Event = mongoose.model('Event');

require('superagent-retry')(request);

var geocodeWorker = function(location, callback) {
	geocoder.geocode(location, callback);
}

var plusWorker = function(url, callback) {
	request.get(url).retry(2).end(function(err, res) {
		if(err) { console.log(err); }
		callback(err, err ? null : res.body);
	});
}

var geocodeQueue = new TimeQueue(geocodeWorker, { concurrency: 3, every: 1000 });
var plusQueue = new TimeQueue(plusWorker, { concurrency: 4, every: 1000 });

module.exports = {
	fetchChapters: function(callback) {
		if(callback == null) return;

		var chapters = [];
		request.get("https://developers.google.com/groups/directorygroups/")
			.retry(5).end(function(err, res) {
			var response = res.body;
			async.each(response.groups, function(rawChapter, groupCallback) {

				Chapter.findOne({ _id: rawChapter.gplus_id }, function (err, chapter) {
					var isNew = chapter == null;

					if(isNew) {
						chapter = new Chapter();
						chapter._id = rawChapter.gplus_id;
					}

					var processChapter = function(chapter) {

						Country.findOne({ name: rawChapter.country }, function(err, country) {
							chapter.name = rawChapter.name;
							chapter.city = rawChapter.city;
							chapter.state = rawChapter.state;
							chapter.country = country != undefined ? country._id : rawChapter.country;
							chapter.group_type = rawChapter.group_type;
							chapter.status = rawChapter.status;
							chapter.site = rawChapter.site;
							chapters.push(chapter);

							groupCallback(null);
						});
					};

					plusQueue.push("https://www.googleapis.com/plus/v1/people/"+chapter._id+"?fields=urls&key="+config.keys.google.simpleApiKey, function(err, res) {
						if(err) {
							console.log(err);
							return;
						}

						var gplusResponse = res;

						var organizers = [];
						var lookup = [];
						if(gplusResponse.urls != undefined) {
							for(var i = 0; i < gplusResponse.urls.length; i++) {
								var link =  gplusResponse.urls[i];

								if(link.value.indexOf("plus.google.com") != -1 && link.value.indexOf("communities") == -1) {
									lookup.push(link.value);
								}
							}
						} else {
							console.log("got no links from gplus: "+"https://www.googleapis.com/plus/v1/people/"+chapter._id+"?fields=urls&key="+config.keys.google.simpleApiKey);
							console.log(res);
						}

						if(lookup.length == 0) {
							console.log("no organizers found in: ");
							console.log(gplusResponse.urls);
						}
						async.each(lookup, function(url, callback) {
							// G+ ID
							var patt=/([0-9]{21})|(\+[^\/]+)/g;
							var result = null;
							var found;
							while (found = patt.exec(url)) {
								result = found[0];
							}
							if(result != null) {
								plusQueue.push("https://www.googleapis.com/plus/v1/people/"+result+"?fields=objectType,id&key="+config.keys.google.simpleApiKey, function(err, res) {
									if(err) {
										callback(err)
									} else {
										if(res.objectType == "person") {
											organizers.push(res.id);
										}
										callback(null);
									}
								});
							} else {
								console.log("unknown url: "+ url);
								callback(null);
							}
						},function(err) {
							chapter.organizers = organizers;

							if(chapter.organizers.length == 0) {
								console.log("zero organizers for chapter "+ chapter._id + ", "+ rawChapter.name);
							}

							if(rawChapter.geo && ((rawChapter.geo && rawChapter.geo.lng) || (!isNew && chapter.geo ))) {
								chapter.geo = {
									lng: rawChapter.geo.lng,
									lat: rawChapter.geo.lat
								};
								processChapter(chapter);
							} else {
								geocodeQueue.push(chapter.city+", "+ chapter.country, function(err, data) {
									if(err)
									console.log(err);

									if(!err && data.length > 0) {
										chapter.geo = { lng: data[0].longitude, lat: data[0].latitude };
									}

									processChapter(chapter);
								});
							}
						});
					});
				});
			}, function(err) {
				console.log("all chapters done");
				console.log(err);
				callback(err, chapters);
			});
		});
	},
	fetchTags: function(callback) {
		if(!callback) return;
		request.get("https://developers.google.com/tags/gettags").retry(5).end(function(err, res) {
			if(err) {
				return callback(err, null);
			}

			callback(null, res.body);
		});
	},
	fetchTaggedEvents: function(tag, month, year, callback) {
		if(!callback) return;

		month = month || moment().month();
		year = year || moment().year(); 

		var end = moment().year(year).month(month).add('months', 1).date(10).seconds(0).minutes(0).hours(0).unix();
		var start = moment().year(year).month(month).date(1).subtract('days', 10).seconds(0).minutes(0).hours(0).unix();

		var now = moment().unix();
		request.get("https://google-developers.appspot.com/events/event-markers.public?tag="+tag+"&start="+start+"&end="+end+"&_="+now).retry(5).end(function(err, res) {
			if(err) {
				return callback(err, null);
			}

			callback(null, res.body);
		});
	},
	fetchEventsForChapter: function(start, end, chapterId, callback) {

		var start = start || moment().add('months', 1).date(1).subtract('days', 1).seconds(0).minutes(0).hours(0).unix();
		var end = end || moment().date(1).seconds(0).minutes(0).hours(0).unix();

		var now = moment().unix();
		request.get("https://developers.google.com/events/feed/json?group="+chapterId+"&start="+start+"&end="+end).retry(5).end(function(error, result) {
			if(error) {
				if(callback)
					callback(error);
				return;
			}

			var eventList = result.body;

			if(eventList.length == 0 && callback)
				return callback(null, []);

			var events = [];
			if(eventList && eventList instanceof Array) {
				async.each(eventList,
					function(rawEvent, eventCallback) {
						Event.findOne({ _id: rawEvent.id }, function (err, event) {
							var isNew = event == null;

							if(isNew) {
								event = new Event();
								event._id = rawEvent.id;
							}

							var processEvent = function(event) {

								event.chapter = chapterId;
								event.start = moment(rawEvent.start).toDate();
								event.end = moment(rawEvent.end).toDate();
								event.allDay = rawEvent.allDay ? true : false;
								event.title = rawEvent.title;
								event.iconUrl = rawEvent.iconUrl;
								event.eventUrl = rawEvent.gPlusEventLink;
								event.timezone = rawEvent.timezoneName;

								if(rawEvent.participantsCount)
									event.participants = rawEvent.participantsCount;

								if(rawEvent.description)
									event.about = rawEvent.description.trim().replace(/\n/g, '<br />');

								events.push(event);

								eventCallback(null);
							};

							if(!isNew && rawEvent.location == event.location) {
								processEvent(event);
							} else {
								event.location = rawEvent.location;
								geocodeQueue.push(rawEvent.location, function(err, data) {
									if(err)
										console.log(err);

									if(!err && data.length > 0) {
										event.geo = { lng: data[0].longitude, lat: data[0].latitude };
									}

									processEvent(event);
								});
							}

						});
					},
					function(err) {
						callback(null, events);
					}
				);

			} else {
				console.log(result.body);
				return callback(null, []);
			}
		});
	}
};
