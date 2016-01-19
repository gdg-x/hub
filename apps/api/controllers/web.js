var log = require(process.cwd() + '/libs/log/')(module);
var path = require('path');

exports.partials = function (req, res, next) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function (err, html) {
    if (err) {
      log.error(err);
      return next(err);
    } else {
      res.send(html);
    }
  });
};

exports.home = function (req, res) {
  res.render('index');
};
