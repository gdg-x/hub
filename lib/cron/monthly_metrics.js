'use strict';

var CronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new CronJob('0 0 1 * *', function(){
	risky.sendTask('monthly_metrics');
});
