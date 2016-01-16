var config = require('config');
var express = require('express');
var passport = require('passport');
var compress = require('compression');
var morgan = require('morgan');
var responseTime = require('response-time');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');

var log = require('../log/')(module);
var request = require('./request');
var router = require('./router');
var response = require('./response');
var cwd = process.cwd();
var mongoStore = require('connect-mongo')(session);

exports.init = function (app, cb) {
  app.set('views', cwd + '/apps/api/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.set('x-powered-by', false);
  app.use(express.static(cwd + '/public'));
  app.use(request.id);
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(morgan(config.status));
  app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(responseTime());
  app.use(session({
    secret: config.session.secret,
    resave: false,
    name: config.session.name,
    store: new mongoStore({mongooseConnection: mongoose.connection}),
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(request.json);
  router.init(app);
  app.use(response.notFound);
  app.use(response.end);
  log.info('Express init');
  if (cb) {
    cb();
  }
};
