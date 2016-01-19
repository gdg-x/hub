'use strict';

var mongoose = require('mongoose'),
  utils = require('../../../../../libs/express/utils'),
  Event = mongoose.model('Event'),
  moment = require('moment'),
  async = require('async');

module.exports = function (app, cacher) {

  app.route('get', '/events', {
    summary: 'Returns a list of all Events in the Hub Database'
  }, cacher.cache('hours', 6), utils.getModel('Event', {}));

  app.route('get', '/events/past', {
    summary: 'Returns a list of all past Events'
  }, cacher.cache('hours', 6), utils.getModel('Event', {
    end: {'$lt': new Date()}
  }));

  app.route('get', '/events/upcoming', {
    summary: 'Returns a list of all upcoming Events'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    start: {'$gte': new Date()}
  }, null, false, {sort: {start: 1}}));

  app.route('get', '/events/today', {
    summary: 'Returns a list of all Events happening today (UTC)'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    '$or': [
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
    ]
  }));

  app.route('get', '/events/now', {
    summary: 'Returns a list of all events happening right now'
  }, utils.getModel('Event', {
    start: {'$lte': new Date()},
    end: {'$gte': new Date()}
  }));

  app.route('get', '/events/stats', {
    summary: 'General statistics about schedules events, used tags etc.'
  }, cacher.cache('hours', 6), function (req, res) {
    async.parallel([
      function (callback) {
        // Count Tags
        Event.aggregate([
          {$match: {end: {'$gt': new Date()}}}, /* Query can go here, if you want to filter results. */
          {$project: {tags: 1}}, /* select the tokens field as something we want to 'send' to the next command in the chain */
          {$unwind: '$tags'}, /* this converts arrays into unique documents for counting */
          {
            $group: {
              /* execute 'grouping' */
              _id: '$tags', /* using the 'token' value as the _id */
              count: {$sum: 1} /* create a sum value */
            }
          },
          {$sort: {count: -1}},
          {$limit: 10}
        ], function (err, tags) {
          var tagStats = {};
          if (tags) {
            for (var i = 0; i < tags.length; i++) {
              tagStats[tags[i]._id] = tags[i].count;
            }
          }
          callback(err, tagStats);
        });
      },
      function (callback) {
        // Count Tags
        Event.aggregate([
          {$match: {}}, /* Query can go here, if you want to filter results. */
          {$project: {tags: 1}}, /* select the tokens field as something we want to 'send' to the next command in the chain */
          {$unwind: '$tags'}, /* this converts arrays into unique documents for counting */
          {
            $group: {
              /* execute 'grouping' */
              _id: '$tags', /* using the 'token' value as the _id */
              count: {$sum: 1} /* create a sum value */
            }
          },
          {$sort: {count: -1}},
          {$limit: 10}
        ], function (err, tags) {
          var tagStats = {};
          if (tags) {
            for (var i = 0; i < tags.length; i++) {
              tagStats[tags[i]._id] = tags[i].count;
            }
          }
          callback(err, tagStats);
        });
      },
      function (callback) {
        // Count Participating Chapters upcoming
        Event.aggregate([
          {$match: {end: {'$gt': new Date()}}}, /* Query can go here, if you want to filter results. */
          {
            $group: {
              /* execute 'grouping' */
              _id: '$chapter', /* using the 'token' value as the _id */
              count: {$sum: 1} /* create a sum value */
            }
          }
        ], function (err, tags) {
          callback(err, tags ? tags.length : 0);
        });
      },
      function (callback) {
        // Count upcoming
        Event.count({
          end: {'$gt': new Date()}
        }, function (err, count) {
          callback(err, count);
        });
      },
      function (callback) {
        // Count past
        Event.count({
          end: {'$lt': new Date()}
        }, function (err, count) {
          callback(err, count);
        });
      },
      function (callback) {
        Event.aggregate([
          {$match: {}}, /* Query can go here, if you want to filter results. */
          {
            $project: {
              start: 1,
              end: 1,
              duration: {$subtract: ['$end', '$start']}
            }
          }, /* select the tokens field as something we want to 'send' to the next command in the chain */
          {
            $group: {
              /* execute 'grouping' */
              _id: 'total', /* using the 'token' value as the _id */
              count: {$sum: '$duration'} /* create a sum value */
            }
          }
        ], function (err, total) {
          if (err) {
            callback(err, null);
          } else {
            callback(err, total.length > 0 ? total[0].count : 0);
          }
        });
      },
      function (callback) {
        Event.aggregate([
          {$match: {end: {'$gt': new Date()}}}, /* Query can go here, if you want to filter results. */
          {
            $project: {
              start: 1,
              end: 1,
              duration: {$subtract: ['$end', '$start']}
            }
          }, /* select the tokens field as something we want to 'send' to the next command in the chain */
          {
            $group: {
              /* execute 'grouping' */
              _id: 'total', /* using the 'token' value as the _id */
              count: {$sum: '$duration'} /* create a sum value */
            }
          }
        ], function (err, total) {
          if (err) {
            callback(err, null);
          } else {
            callback(err, total.length > 0 ? total[0].count : 0);
          }
        });
      }
    ], function (err, results) {
      if (err) {
        log.info(err);
        res.send(500, 'Internal Server Error');
      } else {
        // jshint -W106
        res.jsonp({
          upcoming_top_tags: results[0],
          alltime_top_tags: results[1],
          upcoming_groups: results[2],
          total_events_duration_ms: results[5],
          total_upcoming_events_duration_ms: results[6],
          total_events: results[3] + results[4],
          upcoming_events: results[3],
          past_events: results[4]
        });
        // jshint +W106
      }
    });
  });

  app.route('get', '/events/:eventId/near', {
    summary: 'Returns a list of events happening in the vicinity (~500km) of the specified Event'
  }, cacher.cache('hours', 6), function (req, res) {
    Event.findOne({_id: req.params.eventId}, function (err, evt) {
      if (evt.geo) {
        /*Event.find({ geo: { $nearSphere: [evt.geo.lng, evt.geo.lat]  } }, function(err, events) {
         log.info(err);
         if(events)
         res.jsonp(events);
         else
         res.jsonp([]);
         });*/

        log.info(evt);
        mongoose.connection.db.executeDbCommand({
          geoNear: 'events',  // the mongo collection
          near: [evt.geo.lng, evt.geo.lat], // the geo point
          spherical: true,  // tell mongo the earth is round, so it calculates based on a spherical location system
          distanceMultiplier: 6371, //6378.137,
          maxDistance: 500 / 6371
        }, function (err, result) {
          if (err) {
            console.error(err);
            return res.send(500, 'Internal Server Error');
          }
          res.jsonp(result.documents[0].results);
        });
      } else {
        res.jsonp([]);
      }

    });
  });

  app.route('get', '/events/near/:lat/:lng/:maxDistance', {
    summary: 'Returns a list of upcoming/live events which are within :maxDistance of the specified lat, lng (distances are expressed in kilometers)'
  }, cacher.cache('hours', 6), function (req, res) {

    if (!req.params.lat || !req.params.lng) {
      return res.send(500, 'Please specify lat and lng');
    }

    mongoose.connection.db.executeDbCommand({
      geoNear: 'events',  // the mongo collection
      near: [parseFloat(req.params.lng), parseFloat(req.params.lat)], // the geo point
      spherical: true,  // tell mongo the earth is round, so it calculates based on a spherical location system
      distanceMultiplier: 6371, //6378.137,
      maxDistance: parseFloat(req.params.maxDistance) / 6371,
      query: {
        '$or': [
          {start: {'$lte': new Date()}, end: {'$gte': new Date()}},
          {start: {'$gte': new Date()}}
        ]
      }
    }, function (err, result) {
      if (err) {
        console.error(err);
        return res.send(500, 'Internal Server Error');
      }
      res.jsonp(result.documents[0].results);
    });
  });

  app.route('get', '/events/year/:year', {
    summary: 'Returns a list of all Events scheduled in the specified year'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      start: {
        '$gte': moment().year(req.params.year).dayOfYear(0).hours(0).minutes(0).seconds(0).milliseconds(0)
      },
      end: {
        '$lt': moment().year(req.params.year).dayOfYear(0).add('years', 1)
          .subtract('days', 1).hours(0).minutes(0).seconds(0).milliseconds(0)
      }
    })(req, res);
  });

  app.route('get', '/events/year/:year/:month', {
    summary: 'Returns a list of all Events scheduled in the specified year and month'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      start: {
        '$gte': moment().year(req.params.year).month(req.params.month - 1)
          .date(1).hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
      },
      end: {
        '$lt': moment().year(req.params.year).month(req.params.month - 1).date(1)
          .add('months', 1).hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
      }
    })(req, res);
  });

  app.route('get', '/events/tags', {
    summary: 'Returns a list of all the tags currently used for Events'
  }, cacher.cache('hours', 2), function (req, res) {
    Event.aggregate([
      {$match: {}}, /* Query can go here, if you want to filter results. */
      {$project: {tags: 1}}, /* select the tokens field as something we want to 'send' to the next command in the chain */
      {$unwind: '$tags'}, /* this converts arrays into unique documents for counting */
      {
        $group: {
          /* execute 'grouping' */
          _id: '$tags', /* using the 'token' value as the _id */
          count: {$sum: 1} /* create a sum value */
        }
      }
    ], function (err, tags) {
      var tagsList = [];

      if (err) {
        return res.send(500, err);
      }

      if (tags) {
        for (var i = 0; i < tags.length; i++) {
          tagsList.push(tags[i]._id);
        }
      }
      return res.json(tagsList);
    });
  });

  app.route('get', '/events/:eventId', {
    summary: 'Returns information on a single Event'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    _id: 'eventId'
  }, null, true));

  app.route('get', '/events/tag/:tag', {
    summary: 'Returns a list of all Events which have been assigned the specified tag(s)'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    tags: 'tag'
  }));

  app.route('get', '/events/tag/:tag/upcoming', {
    summary: 'Returns a list of all upcoming Events which have been assigned the specified tag(s)'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    tags: 'tag',
    start: {'$gte': new Date()}
  }));

  app.route('get', '/events/tag/:tag/:start/:end', {
    summary: 'Returns a list of all Events happening between the specified start and end timestamps and have been assigned the specified tag(s)'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      tags: 'tag',
      start: {'$gt': req.params.start},
      end: {'$lt': req.params.end}
    })(req, res);
  });

  app.route('get', '/events/:start/:end', {
    summary: 'Returns a list of all Events happening between the specified start and end timestamps'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      start: {'$gt': req.params.start},
      end: {'$lt': req.params.end}
    })(req, res);
  });

  app.route('get', '/chapters/:chapterId/events', {
    summary: 'Returns a list of all Events scheduled by the specified Chapter'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    chapter: 'chapterId'
  }));

  app.route('get', '/chapters/:chapterId/events/upcoming', {
    summary: 'Returns a list of all upcoming Events scheduled by the specified Chapter'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    chapter: 'chapterId',
    start: {'$gte': new Date()}
  }));

  app.route('get', '/chapters/:chapterId/events/past', {
    summary: 'Returns a list of all past Events by the specified Chapter'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    chapter: 'chapterId',
    end: {'$lt': new Date()}
  }));

  app.route('get', '/chapters/:chapterId/events/month', {
    summary: 'Returns a list of all Events scheduled in the current month by the specified Chapter'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      chapter: 'chapterId',
      start: {'$gt': moment().date(1).minutes(0).seconds(0).milliseconds(0)},
      end: {'$lt': moment().add('months', 1).date(0).minutes(0).seconds(0).milliseconds(0)}
    })(req, res);
  });

  app.route('get', '/chapters/:chapterId/events/year/:year/:month', {
    summary: 'Returns a list of all Events scheduled by the specified Chapter in the specified year and month'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      chapter: 'chapterId',
      start: {'$gt': moment().year(req.params.year).month(req.params.month).date(1).hours(0).minutes(0).seconds(0).milliseconds(0)},
      end: {'$lt': moment().year(req.params.year).month(req.params.month).add('months', 1).date(0).minutes(0).seconds(0).milliseconds(0)}
    })(req, res);
  });

  app.route('get', '/chapters/:chapterId/events/:start/:end', {
    summary: 'Returns a list of all Events scheduled between the specified start and end timestamps by the specified Chapter'
  }, cacher.cache('hours', 2), function (req, res) {
    utils.getModel('Event', {
      chapter: 'chapterId',
      start: {'$gt': req.params.start},
      end: {'$lt': req.params.end}
    })(req, res);
  });

  app.route('get', '/chapters/:chapterId/events/tag/:tag', {
    summary: 'Returns a list of all Events by the specified Chapter which have been assigned the specified tag(s)'
  }, cacher.cache('hours', 2), utils.getModel('Event', {
    chapter: 'chapterId',
    tags: 'tag'
  }));

  app.route('get', '/chapters/:chapterId/events/stats', {
    summary: '-'
  }, cacher.cache('hours', 2), function (req, res) {

    Event.aggregate([
      {$match: {chapter: req.params.chapterId}}, /* Query can go here, if you want to filter results. */
      {$project: {tags: 1}}, /* select the tokens field as something we want to 'send' to the next command in the chain */
      {$unwind: '$tags'}, /* this converts arrays into unique documents for counting */
      {
        $group: {
          /* execute 'grouping' */
          _id: '$tags', /* using the 'token' value as the _id */
          count: {$sum: 1} /* create a sum value */
        }
      }
    ], function (err, tags) {
      res.jsonp(tags);
    });
  });
};
