var config = require('config');
var uuid = require('node-uuid');

exports.id = function (req, res, next) {
  req.id = uuid.v4();
  next();
};

exports.json = function (req, res, next) {
  var asc = req.query.asc === 'true' ? '-' : '';
  req.query.sort = asc + (req.query.sort || 'no');
  var page = req.query.page || 1;
  req.query.limit = config.paging.size;
  req.query.skip = (page - 1) * req.query.limit;
  delete req.query.page;
  delete req.query.asc;
  next();
};
