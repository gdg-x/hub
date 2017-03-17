'use strict';

var mongoose = require('mongoose'),
  MonthlyMetric = mongoose.model('MonthlyMetric'),
  async = require('async');

module.exports = function (app) {

  app.route('get', '/metrics/types', {
    summary: 'Returns a list of available metric types'
  }, function (req, res) {

    async.series([
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
};
