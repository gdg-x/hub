'use strict';

var fetchChapters = require('./fetch_chapters');
var fetchEvents = require('./fetch_events');
var monthlyMetrics = require('./monthly_metrics');

module.exports = function (name, options) {
  switch (name) {
    case 'fetch_chapters':
      fetchChapters(options, function(error) {
        console.error('Failed to fetch chapters: ' + JSON.stringify(error));
        return 500;
      });
      break;
    case 'fetch_events':
      fetchEvents(options, function(error) {
        console.error('Failed to fetch events: ' + JSON.stringify(error));
        return 500;
      });
      break;
    case 'monthly_metrics':
      monthlyMetrics(options, function(error) {
        console.error('Failed to compute monthly metrics: ' + JSON.stringify(error));
        return 500;
      });
      break;
    default:
      return 404;
  }
  return 200;
};
