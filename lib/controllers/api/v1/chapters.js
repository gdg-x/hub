'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	app.route("get", "/chapters", {
		summary: "Returns a list containing all Chapters"
	}, cacher.cache('hours', 6), utils.getModel('Chapter', {}, [['country', 'name']]));

	app.route("get", "/chapters/country/:country", {
		summary: "Returns a list containing all Chapters of the specified Country"
	}, cacher.cache('hours', 6), utils.getModel('Chapter', {
		country: "country"
	}, [['country', 'name']]));

	app.route("get", "/chapters/near/:lat/:lng/:maxDistance", {
		summary: "Returns a list of chapters which are within :maxDistance of the specified lat, lng (distances are expressed in kilometers)"
	}, cacher.cache('hours', 6), function(req, res) {

		if(!req.params.lat || !req.params.lng)
			return res.send(500, "Please specify lat and lng");

		mongoose.connection.db.executeDbCommand({
			geoNear : "chapters",  // the mongo collection
			near : [parseFloat(req.params.lng), parseFloat(req.params.lat)] , // the geo point
			spherical : true,  // tell mongo the earth is round, so it calculates based on a spherical location system
			distanceMultiplier: 6371, //6378.137,
			maxDistance: parseFloat(req.params.maxDistance)/6371
		}, function(err, result) {
			if(err) {
				console.error(err);
				return res.send(500, "Internal Server Error");
			}
			res.jsonp(result.documents[0].results);
		});
	});

	app.route("get", "/chapters/:chapterId", {
		summary: "Returns information on a single Chapter"
	}, cacher.cache('hours', 2), utils.getModel('Chapter', {
		_id: "chapterId"
	}, [['country', 'name']], true));
}
