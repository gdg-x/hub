'use strict';
var cronJob = require('cron').CronJob,
	moment = require('moment'),
	risky = require('../risky');

module.exports = new cronJob('0 */5 * * *', function(){
		risky.sendTask("fetch_events", { month: moment().month() });
		risky.sendTask("fetch_events", { month: moment().add("months", 1).month() });
	});