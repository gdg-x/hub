var mongoose = require('mongoose');
var Chapter = mongoose.model('Chapter');
var mongooseUtil = require(process.cwd() + '/libs/mongoose/');

//exports.list = mongooseUtil.paging.bind(null, Chapter);
exports.list = function (req, res, next) {
  mongooseUtil.paging(Chapter, req, res, next);
};
exports.findById = mongooseUtil.findById.bind(null, Chapter);
