'use strict';

var cronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new cronJob('0 0 1 * *', function(){
	risky.sendTask('monthly_metrics');
});
