var mongoose = require('mongoose');
require('mongoose-schema-extend');
var log = require('../log/')(module);
var config = require('config');
var modelsPath = process.cwd() + '/models';
var options = {};
options.server = {};
options.replset = {};
options.server.socketOptions = options.replset.socketOptions = {keepAlive: 1};

var connectionUrl = function () {
  return config.test ? config.mongoose.testUri : config.mongoose.uri;
};

exports.initWithUrl = function (url, cb) {
  mongoose.connect(url, options);
  var db = mongoose.connection;
  var models = [
    'identityCounter',
    'application',
    'chapter',
    'country',
    'daily_metric',
    'event',
    'gde',
    'monthly_metric',
    'oauth_client',
    'oauth_consumer',
    'plus_post',
    'simple_api_key',
    'tag',
    'task_log',
    'user'
  ];
  models.forEach(function (file) {
    log.info('loading mongoose model', file);
    require(modelsPath + '/' + file);
  });

  db.on('error', function (err) {
    throw new Error(err);
  });
  db.once('open', function () {
    log.info('db connection is established');
    cb();
  });
};

exports.init = function (cb) {
  this.initWithUrl(connectionUrl(), cb);
};

exports.paging = function (Model, req, res, next, query, select, populate) {
  var q = Model
    .find(query || {})
    .select(select || '')
    .populate(populate || '')
    .sort(req.query.sort)
    .skip(req.query.skip)
    .limit(req.query.limit);

  q.exec(function (err, result) {
    if (err) {
      return next(err);
    } else {
      return next(result);
    }
  });
};

exports.findById = function (Model, req, res, next, select, populate) {
  var id = req.params.id;
  Model
    .findById(id)
    .select(select || '')
    .populate(populate || '')
    .exec(function (err, result) {
      if (err) {
        return next(err);
      } else {
        return next(result);
      }
    });
};
