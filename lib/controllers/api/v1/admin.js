'use strict';

var redis = require('redis'),
  config = require('../../../config/config'),
  middleware = require('../../../middleware'),
  risky = require('../../../risky');

module.exports = function (app) {
  var redisClient = null;

  if (config.redis) {
    console.log('Using redis for API Rate Limiting...');
    // Setup Redis client for API Rate limiting
    redisClient = redis.createClient(config.redis.port, config.redis.host);

    if (config.redis.password) {
      redisClient.auth(config.redis.password);
    }
    redisClient.on('ready', function () {
      console.log('Redis is ready for use in API Rate Limiting.');
    });
    redisClient.on('error', function (err) {
      console.error('ERR:REDIS:Admin: ' + err);
    });
  }

  app.route('post', '/admin/tasks', {summary: '-'},
    middleware.auth({roles: ['admin']}), function (req, res) {
      // jshint -W106
      risky.sendTask(req.body.task_type, req.body.params,
        function (err, id) {
          if (err) {
            return res.send(500, 'Not executing task.');
          }

          res.jsonp({msg: 'task_runs', taskId: id});
        },
        null, true);
      // jshint +W106
    });

  app.route('post', '/admin/tasks/cluster', {
    summary: '-'
  }, middleware.auth({roles: ['admin']}), function (req, res) {
    res.jsonp(risky.getCluster());
  });

  app.route('post', '/admin/cache/flush', {
    summary: '-'
  }, middleware.auth({roles: ['admin']}), function (req, res) {
    if (redisClient) {
      redisClient.keys('cacher:*', function (err, replies) {
        if (replies.length === 0) {
          res.jsonp({msg: 'nothing to flush', code: 404});
        } else {
          redisClient.del(replies, function (err) {
            if (err) {
              res.jsonp({msg: 'flush failed', code: 500});
            } else {
              res.jsonp({msg: 'flushed express cache', count: replies.length, code: 200});
            }
          });
        }
      });
    } else {
      res.jsonp({msg: 'not connected to redis', code: 500});
    }
  });
};
