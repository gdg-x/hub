'use strict';
var config = require('../config/config'),
	devsite = require('../clients/devsite');

module.exports = function(id, params, cb) {
		devsite.fetchChapters(function(err, chapters) {
			chapters.forEach(function(chapter) {
				chapter.save();
			});
			cb();
		})
	};