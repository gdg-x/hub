'use strict';
var CronJob = require('cron').CronJob,
  moment = require('moment'),
  tasks = require('../tasks');

module.exports = new CronJob('0 */5 * * *', function() {
  // Ask to fetch events for the current month and year.
  // The fetch_events task will actually try to fetch events starting at month - 1 and ending with month + 6.
  // See ../tasks/fetch_events.js for more details.
  tasks('fetch_events', {month: moment().month(), year: moment().year()});
});
