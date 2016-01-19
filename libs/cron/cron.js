var cron = require('cron');
var log = require('../log/')(module);
module.exports = function () {
  var jobs = [];
  return {
    addJob: function (job) {
      if (!(job instanceof cron.CronJob)) {
        throw new Error('Please specify an instance of CronJob');
      }
      if (jobs.indexOf(job) === -1) {
        job.stop();
        jobs.push(job);
        job.start();
        log.info('new cron job is added');
      }
    },
    list: function () {
      return jobs;
    },
    remove: function (job) {
      var idx = jobs.indexOf(job);
      if (idx !== -1) {
        jobs[idx].stop();
        jobs.splice(idx, 1);
      }
    }
  };
};
