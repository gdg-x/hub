'use strict'

/**
 * Returns a list of available metric types
 */
exports.listMetricTypes = function listMetricTypes (req, res, next) {
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
        callback(err, items)
      })
    }
  ],
    // optional callback
    function (err, results) {
      res.jsonp({
        daily: results[0],
        monthly: results[1]
      })
    })
}
