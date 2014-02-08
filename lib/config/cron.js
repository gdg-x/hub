'use strict';

var cron = require('cron');

module.exports = function() {
   
   var jobs = [];

  return {
      addJob: function(job) {
      	if(!(job instanceof cron.CronJob))
      		throw new Error("Please specify an instance of CronJob");
      	
      	if(jobs.indexOf(job) == -1) {
      		job.stop();
      		jobs.push(job);
      		job.start();
      		console.log("Added cronjob");
      	}
      },
      list: function() {
      	return jobs;
      },
      remove: function() {
      	var idx = jobs.indexOf(job);
      	if(idx != -1) {
      		jobs[idx].stop();
      		jobs.splice(idx, 1);
      	}
      }
  };
};