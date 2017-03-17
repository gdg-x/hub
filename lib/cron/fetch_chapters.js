'use strict';
var CronJob = require('cron').CronJob,
  tasks = require('../tasks');

module.exports = new CronJob('0 */5 * * *', function() {
  tasks('fetch_chapters');
});
