'use strict';

var express = require('express'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  favicon = require('serve-favicon'),
  path = require('path'),
  passport = require('passport'),
  config = require('./config');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
// var yesHttps = require('yes-https');
const MongoStore = require('connect-mongo')(session);
// var csrf = require('csurf');

const STATIC_FILE_CACHE_AGE = 604800000; // 1 week
// const YES_HTTPS_MAX_AGE = 120000; // 2 minutes

/**
 * Express configuration
 */
module.exports = function (app) {
  if (process.env.NODE_ENV !== 'production') {
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
    app.use(errorHandler());
    app.set('views', config.root + '/app/views');

    app.use(session({
      cookie: { secure: false },
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({ url: process.env.MONGODB_DB_URL }),
      secret: config.sessionSecret
    }));
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico'), {}));
    app.use(compression());
    app.use(express.static(path.join(config.root, 'public'), { maxAge: STATIC_FILE_CACHE_AGE, etag: true }));
    app.set('views', config.root + '/public/views');

    app.use(session({
      cookie: { secure: true },
      resave: false,
      saveUninitialized: true,
      store: new MongoStore({ url: process.env.MONGODB_DB_URL }),
      secret: config.sessionSecret
    }));
  }

  // Configure GAE proxy and health checks. Force HTTPS.
  app.enable('trust proxy');
  // app.use(yesHttps({ maxAge: YES_HTTPS_MAX_AGE, includeSubdomains: true, preload: true }));
  app.get('/_ah/health', (req, res) => {
    res.sendStatus(200);
  });

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(morgan('[' + process.pid + '] :method :url :status :response-time ms - :res[content-length]'));
  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({ extended: false}));
  app.use(methodOverride());
  app.use(cookieParser());
  // app.use(csrf({cookie: true}));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());
};
