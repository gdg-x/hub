'use strict';

var express = require('express'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  SimpleApiKey = mongoose.model('SimpleApiKey'),
  Cacher = require('cacher'),
  uuid = require('node-uuid'),
  utils = require('./utils'),
  request = require('superagent');

module.exports = function (app) {
  const EDGE_CACHE_MAX_AGE = 3600; // 1 hr
  var versions = [];
  var cacher;

  utils.fixCacher(Cacher);
  // In-Memory Cache
  cacher = new Cacher();

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

      impl.use(apiKeyMiddleware);
      impl.use(analyticsMiddleware(version));
      impl.use(edgeCache);

      impl.route = function (method, path) {
        var args = Array.prototype.slice.call(arguments);

        impl[method](path, args.slice(3));
      };

      impl.get('/', function (req, res) {
        res.redirect('/developers/api');
      });

      require('./' + file)(impl, cacher);

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
