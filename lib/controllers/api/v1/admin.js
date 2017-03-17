'use strict';

var middleware = require('../../../middleware');
var tasks = require('../../../tasks');

module.exports = function(app) {
  app.route('post', '/admin/tasks',
    middleware.auth({roles: ['admin']}), function(req, res) {
    var status = tasks(req.body.task_type);
      if (status === 200) {
        res.jsonp({msg: 'Running task ' + req.body.task_type});
      } else if (status === 404) {
        return res.send(404, 'Unknown task \"' + req.body.task_type + '/".');
      } else if (status === 500) {
        return res.send(500, 'Server failure when running task \"' + req.body.task_type + '/".');
      }
    });
};
