'use strict';

var mongoose = require('mongoose'),
  utils = require('../utils'),
  Application = mongoose.model('Application'),
  SimpleApiKey = mongoose.model('SimpleApiKey'),
  OauthConsumer = mongoose.model('OauthConsumer'),
  middleware = require('../../../middleware');

module.exports = function (app) {

  app.route('post', '/applications', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    var application = new Application(req.body);
    application.users.push({_id: req.user._id, level: 'owner'});

    // jshint -W106
    delete application.created_at;
    delete application.updated_at;
    // jshint +W106

    application.save(function (err) {
      if (err) {
        res.send(500, err);
      } else {
        res.jsonp(application);
      }
    });
  });

  app.route('get', '/applications', {
    summary: '-'
  }, middleware.auth(), function (req, res) {
    utils.getModel('Application', {
      user: req.user._id
    })(req, res);
  });

  app.route('get', '/applications/:applicationId', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, user: req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        res.jsonp(application);
      }
    });
  });

  app.route('delete', '/applications/:applicationId', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        application.remove(function () {
          res.jsonp({code: 200, msg: 'done'});
        });
      }
    });
  });

  app.route('post', '/applications/:applicationId/simpleapikeys', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        var apikey = new SimpleApiKey();
        apikey.application = application._id;
        // jshint -W106
        apikey.activated_by = req.user._id;
        // jshint +W106

        apikey.save(function (err) {
          if (err) {
            res.send(500, err);
          } else {
            res.jsonp(apikey);
          }
        });
      }
    });
  });

  app.route('get', '/applications/:applicationId/simpleapikeys', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        SimpleApiKey.find({application: application._id}, function (err, keys) {
          res.jsonp(keys);
        });
      }
    });
  });

  app.route('get', '/applications/:applicationId/consumers', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        OauthConsumer.find({application: application._id}, function (err, consumers) {
          res.jsonp(consumers);
        });
      }
    });
  });

  app.route('post', '/applications/:applicationId/consumers', {
    summary: '-'
  }, middleware.auth(), function (req, res) {

    Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
      if (err) {
        res.send(500, err);
      } else if (!application) {
        res.send(404, 'Not found');
      } else {
        var consumer = new OauthConsumer(req.body);
        consumer.application = application._id;

        // jshint -W106
        delete consumer.created_at;
        delete consumer.updated_at;
        // jshint +W106

        consumer.save(function (err) {
          if (err) {
            res.send(500, err);
          } else {
            res.jsonp(consumer);
          }
        });
      }
    });
  });
};
