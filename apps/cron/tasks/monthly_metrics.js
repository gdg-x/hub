'use strict';

var mongoose = require('mongoose'),
    Chapter = mongoose.model('Chapter'),
    Event = mongoose.model('Event'),
    DailyMetric = mongoose.model('DailyMetric'),
    moment = require('moment'),
    async = require('async'),
    utils = require('../../libs/utils');

module.exports = function (id, params, cb) {
  async.series([
    function (callback) {
      // Count all chapters
      Chapter.count({},
        function (err, count) {
          utils.recordMonthlyMetric('global', 'Global', 'chapterCount', count);
          callback(err, 'chapterCount');
        }
      );
    },
    function (callback) {
      // Count active chapters
      Chapter.count({status: 'active'},
        function (err, count) {
          utils.recordMonthlyMetric('global', 'Global', 'activeChapterCount', count);
          callback(err, 'activeChapterCount');
        }
      );
    },
    function (callback) {
      // Count incubating chapters
      Chapter.count({status: 'incubating'},
        function (err, count) {
          utils.recordMonthlyMetric('global', 'Global', 'incubatingChapterCount', count);
          callback(err, 'incubatingChapterCount');
        }
      );
    },
    function (callback) {
      DailyMetric.find({type: 'plusOneCount', year: moment().year(), month: moment().subtract(1, 'months').month()},
        function (err, metrics) {
          async.each(metrics,
            function (metric) {
              utils.recordMonthlyMetric(metric.subject, metric.subjectType, 'plusOneCount', metric.totalSamples / metric.numSamples);
            },
            function (err) {
              callback(err, 'plusOneCount');
            }
          );
        }
      );
    },
    function (callback) {
      DailyMetric.find({type: 'circledByCount', year: moment().year(), month: moment().subtract(1, 'months').month()},
        function (err, metrics) {
          async.each(metrics,
            function (metric) {
              utils.recordMonthlyMetric(metric.subject, metric.subjectType, 'circledByCount', metric.totalSamples / metric.numSamples);
            },
            function (err) {
              callback(err, 'circledByCount');
            }
          );
        }
      );
    },
    function (callback) {
      Event.count({
          start: {'$gt': moment().subtract(1, 'months').startOf('month').toDate()},
          end: {'$lt': moment().subtract(1, 'months').endOf('month').toDate()}
        },
        function (err, count) {
          utils.recordMonthlyMetric('global', 'Global', 'eventCount', count);
          callback(err, 'eventCount');
        }
      );
    },
    function (callback) {
      Event.aggregate([
        {
          $match: {
            start: {'$gte': moment().subtract(1, 'months').startOf('month').toDate()},
            end: {'$lte': moment().subtract(1, 'months').endOf('month').toDate()}
          }
        },
        {
          $group: {
            /* execute 'grouping' */
            _id: 'participants', /* using the 'token' value as the _id */
            count: {$sum: '$participants'} /* create a sum value */
          }
        }
      ], function (err, items) {
        utils.recordMonthlyMetric('global', 'Global', 'participantCount', items.length > 0 ? items[0].count : 0);
        callback(err, 'participantCount');
      });
    },
    function (callback) {
      var countryChapterMap = [];

      var countEventsForCountry = function (err) {
        callback(err, 'participantCount');
      };

      Chapter.aggregate([
        { $match: {} },
        {
          $group: {
            /* execute 'grouping' */
            _id: '$country', /* using the 'token' value as the _id */
            chapters: {$addToSet: '$_id'} /* create a sum value */
          }
        }
      ], function (err, items) {
        countryChapterMap = items;
        async.each(items,
          function (country, countryCallback) {
            utils.recordMonthlyMetric(country._id, 'Country', 'chapterCount',
              country.chapters.length > 0 ? country.chapters.length : 0);

            Event.count({
                chapter: {$in: country.chapters},
                start: {'$gt': moment().subtract(1, 'months').startOf('month').toDate()},
                end: {'$lt': moment().subtract(1, 'months').endOf('month').toDate()}
              },
              function (err, count) {
                utils.recordMonthlyMetric(country._id, 'Country', 'eventCount', count);

                Event.aggregate([
                  {
                    $match: {
                      chapter: {$in: country.chapters},
                      start: {'$gte': moment().subtract(1, 'months').startOf('month').toDate()},
                      end: {'$lte': moment().subtract(1, 'months').endOf('month').toDate()}
                    }
                  },
                  {
                    $group: {
                      /* execute 'grouping' */
                      _id: 'participants', /* using the 'token' value as the _id */
                      count: {$sum: '$participants'} /* create a sum value */
                    }
                  }
                ], function (err, items) {
                  utils.recordMonthlyMetric(country._id, 'Country', 'participantCount',
                    items.length > 0 ? items[0].count : 0);
                  countryCallback(err);
                });
              }
            );

          },
          function (err) {
            countEventsForCountry(err);
          }
        );
      });
    },
    function (callback) {
      Event.aggregate([
        {
          $match: {
            start: {'$gte': moment().subtract(1, 'months').startOf('month').toDate()},
            end: {'$lte': moment().subtract(1, 'months').endOf('month').toDate()}
          }
        },
        {
          $group: {
            /* execute 'grouping' */
            _id: '$chapter', /* using the 'token' value as the _id */
            count: {$sum: '$participants'} /* create a sum value */
          }
        }
      ], function (err, items) {
        Chapter.find({}, function (err, chapters) {
          for (var j = 0; j < chapters.length; j++) {
            var chapter = chapters[j];
            var count = 0;
            for (var i = 0; i < items.length; i++) {
              if (items[i]._id === chapter._id) {
                count += items[i].count;
              }
            }
            utils.recordMonthlyMetric(chapter._id, 'Chapter', 'participantCount', count);
          }
          callback(err, 'chapterParticipantCount');
        });
      });
    }
  ], function (err) {
    if (err) {
      console.error(err);
    }
    cb();
  });
};
