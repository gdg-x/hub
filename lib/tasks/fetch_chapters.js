'use strict';
var config = require('../config/config'),
	async = require('async'),
	devsite = require('../clients/devsite');

module.exports = function(id, params, cb) {
		devsite.fetchChapters(function(err, chapters) {
			async.each(chapters, function(chapter, chapterCallback) {
				chapter.save(function(err) {
					chapterCallback(err);
				});
			}, function(err) {
				cb(err);
			});
		})
	};