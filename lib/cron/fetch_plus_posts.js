'use strict';
var cronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new cronJob('0 */5 * * *', function(){
		risky.sendTask("fetch_plus_posts");
	});