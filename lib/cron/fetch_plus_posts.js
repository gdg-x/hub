'use strict';
var CronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new CronJob('0 */5 * * *', function(){
		risky.sendTask('fetch_plus_posts');
	});
