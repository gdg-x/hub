'use strict';

var config = require('../config/config'),
  mongoose = require('mongoose'),
  Chapter = mongoose.model('Chapter'),
  Event = mongoose.model('Event'),
  DailyMetric = mongoose.model('DailyMetric'),
  moment = require('moment'),
  async = require('async'),
  utils = require('../../libs/utils'),
  googleapis = require('googleapis');

module.exports = function (id, params, cb) {
  async.series([
    function (acallback) {
      googleapis
        .discover('plus', 'v1')
        .execute(function (err, client) {
          Chapter.find({}, function (err, chapters) {

            var batch = client.newBatchRequest();

            for (var i = 0; i < chapters.length; i++) {
              var chapter = chapters[i];
              batch.add(client.plus.people.get({
                userId: chapter._id,
                fields: 'id,circledByCount,plusOneCount'
              }).withApiKey(config.keys.google.simpleApiKey));
            }

            batch.execute(function (err, results) {
              async.each(results,
                function (item, callback) {

                  if (item) {
                    if (item.plusOneCount) {
                      utils.recordDailyMetric(item.id, 'Chapter', 'plusOneCount', item.plusOneCount);
                    }

                    if (item.circledByCount) {
                      utils.recordDailyMetric(item.id, 'Chapter', 'circledByCount', item.circledByCount);
                    }
                  }

                  callback(null);
                },
                function (err) {
                  acallback(err, 'gplusStats');
                }
              );
            });
          });
        });
    },
    function (callback) {
      Event.count({})
        .or([
          {start: {'$gte': moment().startOf('day').toDate()}, end: {'$lt': moment().endOf('day').toDate()}}, //Starts ends today
          {
            start: {'$lt': moment().startOf('day').toDate()},
            end: {'$lt': moment().endOf('day').toDate(), '$gt': moment().startOf('day').toDate()}
          }, // Started yesterday ends today
          {
            start: {'$gte': moment().startOf('day').toDate(), '$lt': moment().endOf('day').toDate()},
            end: {'$gt': moment().endOf('day').toDate()}
          }, // Starts today ends tomorrow
          {start: {'$lt': moment().startOf('day').toDate()}, end: {'$gt': moment().endOf('day').toDate()}} // Started yesterday ends tomorrow
        ])
        .exec(
        function (err, count) {
          utils.recordDailyMetric('global', 'Global', 'eventCount', count);
          callback(err, 'eventCount');
        }
      );
    },
    function (callback) {
      // Per-Country Metrics
      Chapter.aggregate([
        {$match: {}},
        {
          $group: {
            /* execute 'grouping' */
            _id: '$country', /* using the 'token' value as the _id */
            chapters: {$addToSet: '$_id'} /* create a sum value */
          }
        }
      ], function (err, items) {
        async.each(items,
          function (country, countryCallback) {
            async.series([
                function (seriesCallback) {
                  // Per-Country event count
                  Event.count({
                      chapter: {$in: country.chapters},
                      '$or': [
                        {
                          start: {'$gte': moment().startOf('day').toDate()},
                          end: {'$lt': moment().endOf('day').toDate()}
                        }, //Starts ends today
                        {
                          start: {'$lt': moment().startOf('day').toDate()},
                          end: {'$lt': moment().endOf('day').toDate(), '$gt': moment().startOf('day').toDate()}
                        }, // Started yesterday ends today
                        {
                          start: {'$gte': moment().startOf('day').toDate(), '$lt': moment().endOf('day').toDate()},
                          end: {'$gt': moment().endOf('day').toDate()}
                        }, // Starts today ends tomorrow
                        {start: {'$lt': moment().startOf('day').toDate()}, end: {'$gt': moment().endOf('day').toDate()}} // Started yesterday ends tomorrow
                      ]
                    },
                    function (err, count) {
                      utils.recordDailyMetric(country._id, 'Country', 'eventCount', count);
                      seriesCallback(err);
                    }
                  );
                },
                function (seriesCallback) {
                  // Per-Country plusOneCount, sum up Chapter metrics
                  DailyMetric.find({
                      subject: {$in: country.chapters},
                      subjectType: 'Chapter',
                      year: moment().year(),
                      month: moment().month() + 1,
                      type: 'plusOneCount'
                    },
                    function (err, metrics) {
                      var total = 0;
                      async.each(metrics,
                        function (metric, metricCallback) {
                          total += metric.values[moment().date()];
                          metricCallback(err, null);
                        },
                        function (err) {
                          utils.recordDailyMetric(country._id, 'Country', 'plusOneCount', total);
                          seriesCallback(err);
                        }
                      );
                    }
                  );
                },
                function (seriesCallback) {
                  // Per-Country plusOneCount, sum up Chapter metrics
                  DailyMetric.find({
                      subject: {$in: country.chapters},
                      subjectType: 'Chapter',
                      year: moment().year(),
                      month: moment().month() + 1,
                      type: 'circledByCount'
                    },
                    function (err, metrics) {
                      var total = 0;
                      async.each(metrics,
                        function (metric, metricCallback) {
                          total += metric.values[moment().date()];
                          metricCallback(err, null);
                        },
                        function (err) {
                          utils.recordDailyMetric(country._id, 'Country', 'circledByCount', total);
                          seriesCallback(err);
                        }
                      );
                    }
                  );
                }
              ],
              function (err) {
                countryCallback(err);
              });
          },
          function (err) {
            callback(err, 'countryMetrics');
          }
        );
      });
    },
    function (callback) {
      DailyMetric.aggregate([
        {
          $match: {
            subjectType: 'Chapter',
            year: moment().year(),
            month: moment().month() + 1,
            type: 'circledByCount'
          }
        }, {
          $group: {
            /* execute 'grouping' */
            _id: 'circledByCount', /* using the 'token' value as the _id */
            circledByCount: {$sum: '$values.' + moment().date()} /* create a sum value */
          }
        }
      ], function (err, items) {
        utils.recordDailyMetric('global', 'Global', 'circledByCount', items.length > 0 ? items[0].circledByCount : 0);
        callback(err, 'globalCircledByCount');
      });
    },
    function (callback) {
      DailyMetric.aggregate([
        {
          $match: {
            subjectType: 'Chapter',
            year: moment().year(),
            month: moment().month() + 1,
            type: 'plusOneCount'
          }
        }, {
          $group: {
            /* execute 'grouping' */
            _id: 'plusOneCount', /* using the 'token' value as the _id */
            plusOneCount: {$sum: '$values.' + moment().date()} /* create a sum value */
          }
        }
      ], function (err, items) {
        utils.recordDailyMetric('global', 'Global', 'plusOneCount', items.length > 0 ? items[0].plusOneCount : 0);
        callback(err, 'globalPlusOneCount');
      });
    }
  ], function () {
    cb();
  });
};
