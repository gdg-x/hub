'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {

	app.route("get", "/chapters", {
		summary: "Returns a list containing all Chapters"
	}, cacher.cache('hours', 2), utils.getModel('Chapter', {}, [['country', 'name']]));

	app.route("get", "/chapters/country/:country", {
		summary: "Returns a list containing all Chapters of the specified Country"
	}, cacher.cache('hours', 2), utils.getModel('Chapter', {
		country: "country"
	}, [['country', 'name']]));

	app.route("get", "/chapters/:chapterId", {
		summary: "Returns information on a single Chapter"
	}, cacher.cache('hours', 2), utils.getModel('Chapter', {
		_id: "chapterId"
	}, [['country', 'name']], true));
}
