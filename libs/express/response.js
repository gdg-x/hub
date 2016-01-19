var config = require('config');
var _ = require('lodash');
var mongoose = require('mongoose');
var log = require('../../libs/log/')(module);
var statusCodes = require('http').STATUS_CODES;

var response = {};
response.notFound = function (req, res, next) {
  var err = new Error();
  err.status = 404;
  err.message = 'Can not ' + req.method + ' this URL';
  next(err);
};

response.error = function (err, req, res) {
  if (err.status) {
    res.statusCode = err.status;
  }
  if (res.statusCode < 400) {
    res.statusCode = 500;
  }
  if (err instanceof mongoose.Error) {
    err.message = _.map(err.errors, function (e) {
      return e.message;
    }).join(' ');
    if (err instanceof mongoose.Error.ValidationError) {
      res.statusCode = 400;
    }
  }
  //noinspection JSCheckFunctionSignatures
  var error = {
    code: statusCodes[res.statusCode],
    message: res.statusCode !== 500 ? err.message : statusCodes[500],
    url: req.originalUrl,
    request: req.id,
    detail: {
      url: req.originalUrl,
      body: req.body,
      message: JSON.parse(JSON.stringify(err,
        ['stack', 'message', 'inner', 'errors'], 3))
    }
  };
  if ('test' !== config.status) {
    log.error('Express error', error.detail.message);
  }
  if ('dev' !== config.status) {
    delete error.detail;
  }
  res.json({error: error});
};

response.end = function (data, req, res, next) {
  if (data instanceof Error) {
    return response.error(data, req, res, next);
  }
  res.json(data);
};

module.exports = exports = response;
