'use strict';
var cronJob = require('cron').CronJob,
	risky = require('../risky');

module.exports = new cronJob('0 3 * * *', function(){
	risky.sendTask('fetch_gdes');
});
