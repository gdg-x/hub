'use strict';

var express = require('express'),
  session = require('express-session'),
  path = require('path'),
  passport = require('passport'),
  config = require('./config'),
  redis = require('redis'),
  utils = require('../utils'),
  RedisStore = require('connect-redis')(session);

/**
 * Express configuration
 */
module.exports = function (app) {

  var redisClient;

  if (config.redis) {
    console.log('Using redis for Express...');
    redisClient = redis.createClient(config.redis.port, config.redis.host);

    if (config.redis.password) {
      redisClient.auth(config.redis.password);
    }

    redisClient.on('ready', function () {
      console.log('Redis is ready for use with Express.');
    });
    redisClient.on('error', function (err) {
      console.error('ERR:REDIS:Express: ' + err);
    });
  }

  app.configure('development', function () {
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');

  });

  app.configure('production', function () {
    app.use(function (req, res, next) {
      if (Object.keys(req.headers).length === 0 || req.url === '/mu-7420b817-cdecfc50-f5d31e37-c96b5e8f') {
        return res.send('200', '42');
      } else {
        next();
      }
    });

    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.compress());
    app.use(express.static(path.join(config.root, 'public'), {maxAge: 604800000}));
    app.set('views', config.root + '/views');

    app.use(utils.seoPrerender(redisClient));
  });

  app.configure(function () {
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.logger('[' + process.pid + '] :method :url :status :response-time ms - :res[content-length]'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    if (config.redis) {
      app.use(express.session({
        store: new RedisStore({
          client: redisClient
        }),
        secret: config.sessionSecret
      }));
    } else {
      app.use(express.session({
        secret: config.sessionSecret
      }));
    }

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Router needs to be last
    app.use(app.router);
  });
};
