'use strict';
var cronJob = require('cron').CronJob,
	config = require('../config/config'),
	devsite = require('../clients/devsite');

module.exports = new cronJob('0 */5 * * *', function(){
		devsite.fetchChapters(function(err, chapters) {
			chapters.forEach(function(chapter) {
				chapter.save();
			});
		})
	}, function () {

	}
);