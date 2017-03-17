'use strict';

var CronJob = require('cron').CronJob,
  tasks = require('../tasks');

module.exports = new CronJob('0 0 1 * *', function() {
  tasks('monthly_metrics');
});
