'use strict';

var mongoose = require('mongoose'),
	utils = require('../utils'),
	Chapter = mongoose.model('Chapter'),
	Event = mongoose.model('PlusPost'),
	moment = require('moment'),
	async = require('async'),
	middleware = require('../../../middleware'),
	risky = require('../../../risky'),
	devsite = require('../../../clients/devsite');

module.exports = function(app, cacher) {
	app.route("get", "/plus/posts/hashtag/:hashtags", {
		summary: "Returns a list of Google+ posts made by Chapters which contain the specified hashtag(s)"
	}, cacher.cache('hours', 2), utils.getModel('PlusPost', {
		hashtags: "hashtags"
	}));

	app.route("get", "/chapters/:chapterId/posts", {
		summary: "Returns a list of Google+ posts made by the specified Chapter"
	}, cacher.cache('hours', 2), utils.getModel('PlusPost', {
		chapter: "chapterId"
	}));

	app.route("get", "/chapters/:chapterId/posts/:hashtags", {
		summary: "Returns a list of Google+ posts made by the specified Chapter which contain the specified hashtag(s)"
	}, cacher.cache('hours', 2), utils.getModel('PlusPost', {
		chapter: "chapterId",
		hashtags: "hashtags"
	}));
};