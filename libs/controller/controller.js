var fs = require('fs');
var _ = require('lodash');
module.exports = function (path) {
  var controllers = {};
  _.each(fs.readdirSync(path), function (file) {
    if (file.match(/\.js$/)) {
      controllers[file.substring(0, file.length - 3)] =
        require(path + '/' + file);
    }
  });
  return controllers;
};
