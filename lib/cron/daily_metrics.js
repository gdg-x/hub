'use strict';

var CronJob = require('cron').CronJob,
  risky = require('../risky');

module.exports = new CronJob('0 8 * * *', function(){
	risky.sendTask('daily_metrics');
});
