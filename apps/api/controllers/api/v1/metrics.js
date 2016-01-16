'use strict';

var mongoose = require('mongoose'),
  utils = require('../../../../../libs/express/utils'),
  DailyMetric = mongoose.model('DailyMetric'),
  MonthlyMetric = mongoose.model('MonthlyMetric'),
  async = require('async');

module.exports = function (app) {

  app.route('get', '/metrics/types', {
    summary: 'Returns a list of available metric types'
  }, function (req, res) {

    async.series([
        function (callback) {
          DailyMetric.aggregate([
            {$match: {}},
            {
              $group: {
                /* execute 'grouping' */
                _id: '$type', /* using the 'token' value as the _id */
                subjectTypes: {$addToSet: '$subjectType'} /* create a sum value */
              }
            }
          ], function (err, items) {
            callback(err, items);
          });
        },
        function (callback) {
          MonthlyMetric.aggregate([
            {$match: {}},
            {
              $group: {
                /* execute 'grouping' */
                _id: '$type', /* using the 'token' value as the _id */
                subjectTypes: {$addToSet: '$subjectType'} /* create a sum value */
              }
            }
          ], function (err, items) {
            callback(err, items);
          });
        }
      ],
      // optional callback
      function (err, results) {
        res.jsonp({
          daily: results[0],
          monthly: results[1]
        });
      });

  });

  app.route('get', '/metrics/daily/:subject/:metric/:year/:month', {
    summary: 'Returns the daily metric information for the specified subject and metric in the selected year and month'
  }, utils.getModel('DailyMetric', {
    subject: 'subject',
    type: 'metric',
    year: 'year',
    month: 'month'
  }, null, true));
};
