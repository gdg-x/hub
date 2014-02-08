'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('Event'),
	devsite = require('../../../clients/devsite');

module.exports = function(app) {

	app.route("get", "/chapters", {}, utils.getModel('Chapter'));
	app.route("get", "/chapter/:chapterId", {}, utils.getModel('Chapter', {
		_id: "chapterId"
	}));
}
