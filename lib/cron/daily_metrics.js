'use strict';

var cronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new cronJob('0 8 * * *', function(){
	risky.sendTask("daily_metrics");
});