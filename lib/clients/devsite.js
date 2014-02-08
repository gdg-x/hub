'use strict';

var mongoose = require('mongoose'),
	request = require('superagent'),
	moment = require('moment'),
	cheerio = require('cheerio'),
	geocoder = require('geocoder'),
	config = require('../config/config'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event');

module.exports = {
	fetchChapters: function(callback) {
		if(callback == null) return;

		request.get("https://developers.google.com/groups/directorygroups/", function(err, res) {
			var response = res.body;
			var chapters = [];
			response.groups.forEach(function(chapter) {

				request.get("https://www.googleapis.com/plus/v1/people/"+chapter.gplus_id+"?fields=urls&key="+config.keys.google.simpleApiKey, function(err, res) {
					if(err) {
						return;
					}

					var gplusResponse = res.body;

					var organizers = [];
					if(gplusResponse.urls != undefined) {
						for(var i = 0; i < gplusResponse.urls.length; i++) {
							var link =  gplusResponse.urls[i];

							if(link.label.indexOf("Organizer") != -1 || link.label.indexOf("organizer") != -1) {
								// G+ ID
								var patt=/[0-9]{21}/g;
								var result = patt.exec(link.value);
								if(result != null)
									organizers.push(result[0]);

								// G+ Vanity
								patt = /\+[A-Za-z0-9]+/g;
								result = patt.exec(link.value);
								if(result != null) {
									request.get("https://www.googleapis.com/plus/v1/people/"+encodeURIComponent(result[0])+"?fields=id&key="+config.keys.google.simpleApiKey, function(err, res) {
										organizers.push(res.body.id);
									});
								}
							}
						}
					}

					var c = new Chapter();
					c._id = chapter.gplus_id;
					c.geo = chapter.geo;
					c.name = chapter.name;
					c.city = chapter.city;
					c.state = chapter.state;
					c.country = chapter.country;
					c.group_type = chapter.group_type;
					c.status = chapter.status;
					c.site = chapter.site;
					c.organizers = organizers;
					chapters.push(c);

					if(chapters.length == response.groups.length) {
						callback(null, chapters);
					}
				});

			});
		});
	},
	fetchTags: function(callback) {
		if(!callback) return;
		request.get("https://developers.google.com/tags/gettags", function(err, res) {
			if(err) {
				return callback(err, null);
			}

			callback(null, res.body);
		});
	},
	fetchTaggedEvents: function(tag, callback) {
		if(!callback) return;

		var lastDayOfMonth = moment().add('months', 1).date(1).subtract('days', 1).seconds(0).minutes(0).hours(0).unix();
		var firstDayOfMonth = moment().date(1).seconds(0).minutes(0).hours(0).unix();
		var now = moment().unix();

		request.get("https://google-developers.appspot.com/events/event-markers.public?tag="+tag+"&start="+firstDayOfMonth+"&end="+lastDayOfMonth+"&_="+now, function(err, res) {
			if(err) {
				return callback(err, null);
			}

			callback(null, res.body);
		});
	},
	fetchEventsForChapter: function(chapterId, callback) {

		var lastDayOfMonth = moment().add('months', 1).date(1).subtract('days', 1).seconds(0).minutes(0).hours(0).unix();
		var firstDayOfMonth = moment().date(1).seconds(0).minutes(0).hours(0).unix();
		var now = moment().unix();

		request.get("https://developers.google.com/events/feed/json?group="+chapterId+"&start="+firstDayOfMonth+"&end="+lastDayOfMonth, function(error, result) {

			if(error) {
				if(callback)
					callback(error);
				return;
			}

			var eventList = result.body;

			if(eventList.length == 0 && callback)
				return callback(null, []);

			var events = [];

			eventList.forEach(function(rawEvent) {

				Event.findOne({ _id: rawEvent.id }, function (err, event) {
					geocoder.geocode(rawEvent.location, function ( geocodeErr, geocodeData ) {
						var isNew = false;
						if(event == null) {
							event = new Event();
							event._id = rawEvent.id;
							isNew = true;
						}

						event.chapter = chapterId;
						event.start = moment(rawEvent.start).toDate();
						event.end = moment(rawEvent.end).toDate();
						event.allDay = rawEvent.allDay ? true : false;
						event.location = rawEvent.location;
						event.title = rawEvent.title;
						event.iconUrl = rawEvent.iconUrl;
						event.eventUrl = rawEvent.gPlusEventLink;
						event.timezone = rawEvent.timezoneName;

						if(rawEvent.description)
							event.about = rawEvent.description.trim().replace(/\n/g, '<br />');

						if(geocodeErr)
							console.log(geocodeErr);

						if(!geocodeErr && geocodeData.results.length > 0) {
							event.geo = {
								lat:  geocodeData.results[0].geometry.location.lat,
								lng:  geocodeData.results[0].geometry.location.lng
							};
						}

						events.push(event);

						if(eventList.length == events.length && callback) {
							callback(null, events);
						}
					});
				});

			});
		});
	}
};
