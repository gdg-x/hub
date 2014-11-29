'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Tag = mongoose.model('Tag'),
	moment = require('moment'),
	async = require('async'),
	middleware = require('../../../middleware');

module.exports = function(app, cacher) {
	app.route("get", "/tags", {
			summary: "Returns a list of all Event Tags in the Hub Database"
		}, cacher.cache('hours', 24), utils.getModel('Tag', {}));

	app.route("get", "/tags/:tagId", {
			summary: "Returns information on a single tag"
		}, cacher.cache('hours', 2), utils.getModel('Tag', {
			_id: "tagId"
		}, null, true));
};