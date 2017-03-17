'use strict';

var express = require('express'),
  documentation = require('./documentation.js'),
  redis = require('redis'),
  rate = require('express-rate'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  SimpleApiKey = mongoose.model('SimpleApiKey'),
  annotations = require('express-annotations'),
  Cacher = require('cacher'),
  uuid = require('node-uuid'),
  utils = require('./utils'),
  request = require('superagent'),
  CacherRedis = require('cacher-redis');

module.exports = function (app) {
  const EDGE_CACHE_MAX_AGE = 3600; // 1 hr
  var versions = [];
  var rateHandler;
  var cacher;
  var redisClient;

  utils.fixCacher(Cacher);

  if (config.redis) {
    console.log('Using redis for API support...');

    // Setup Redis client for API Rate limiting
    redisClient = redis.createClient(config.redis.port, config.redis.host);

    if (config.redis.password) {
      redisClient.auth(config.redis.password);
    }

    redisClient.on('ready', function () {
      console.log('Redis Client for API support is ready.');
    });
    redisClient.on('error', function (err) {
      console.error('ERR:REDIS:Cacher: ' + err);
    });

    rateHandler = new rate.Redis.RedisRateHandler({client: redisClient});

    cacher = new Cacher(new CacherRedis(redisClient));
  } else {
    console.log('Using in-memory');

    // Fallback to In-Memory handler if Redis is not available
    rateHandler = new rate.Memory.MemoryRateHandler();

    // In-Memory Cache
    cacher = new Cacher();
  }

  var analyticsMiddleware = function (version) {
    return function (req, res, next) {

      var cookie = req.cookies.apis;

      if (!cookie) {
        cookie = uuid.v4();
        res.cookie('apis', cookie, {maxAge: 63072000000, httpOnly: true});
      }

      if (config.keys.google.analytics) {
        request.post('https://ssl.google-analytics.com/collect')
          .type('form')
          .send({
            v: '1',
            tid: config.keys.google.analytics.trackingId,
            cid: cookie,
            ua: req.headers['User-Agent'] || 'Hub/1.0',
            t: 'pageview',
            dp: '/api/' + version + req.path,
            dr: req.headers.Referer,
            uip: req.headers['X-Forwarded-For'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
          })
          .end();
      }

      next();
    };
  };

  var apiKeyMiddleware = function (req, res, next) {
    if (req.query.apikey) {
      SimpleApiKey.findOne({apikey: req.query.apikey})
        .populate('application')
        .exec(function (err, apikey) {
          req.apikey = apikey;
          next();
        });
    } else {
      next();
    }
  };

  var rateMiddleware = function (req, res, next) {

    var limit = 10000;

    if (req.apikey) {
      limit = 50000;
    }

    var rm = rate.middleware({
      handler: rateHandler,
      limit: limit,
      interval: 86400,
      setHeadersHandler: function (req, res, rate, limit, resetTime) {
        var remaining = limit - rate;

        if (remaining < 0) {
          remaining = 0;
        }
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', resetTime);
      },
      onLimitReached: function (req, res, rate, limit, resetTime, next) { // jshint ignore:line
        res.json(403, {error: 'Rate limit exceeded. Check headers for limit information.'});
      },
      getRouteKey: function (req) { // jshint ignore:line
        return 'api';
      },
      getRemoteKey: function (req) {
        return req.headers['x-client-ip'] || req.ip;
      }
    });

    rm(req, res, next);
  };


  /**
   * Enable Google Edge caching for our API
   * @param req
   * @param res
   * @param next
   */
  var edgeCache = function (req, res, next) {
    res.header('Cache-Control', 'public, max-age=' + EDGE_CACHE_MAX_AGE);
    res.header('Pragma', 'Public');
    next();
  };

  require('fs').readdirSync(__dirname + '/').forEach(function (file) {
    if (file.match(/.+\.js/g) === null) {
      var version = file;
      versions.push(version);

      var impl = express();
      annotations.extend(impl);

      impl.use(apiKeyMiddleware);
      impl.use(rateMiddleware);
      impl.use(analyticsMiddleware(version));
      impl.use(edgeCache);

      impl.route = function (method, path, metadata) {
        var args = Array.prototype.slice.call(arguments);

        if (metadata) {
          impl.annotate(method + '-' + path, metadata);
        }

        impl[method](path, args.slice(3));
      };

      impl.get('/', function (req, res) {
        res.redirect('/developers/api');
      });

      require('./' + file)(impl, cacher);

      documentation(version, app, impl);

      app.get('/api/', function (req, res) {
        res.redirect('/developers/api');
      });

      app.use('/api/' + version, impl);
    }
  });

  app.get('/api/versions', function (req, res) {
    res.json(versions);
  });
};
