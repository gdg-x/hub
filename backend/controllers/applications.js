'use strict'

exports.listApplications = function listApplications (req, res, next) {
  utils.getModel('Application', {
    user: req.user._id
  })(req, res)
}

exports.addApplication = function addApplication (req, res, next) {
  var application = new Application(req.body)
  application.users.push({_id: req.user._id, level: 'owner'})

  delete application.created_at
  delete application.updated_at

  application.save(function (err) {
    if (err) {
      res.send(500, err)
    } else {
      res.jsonp(application)
    }
  })
}

exports.getApplication = function getApplication (req, res, next) {
  Application.findOne({_id: req.params.applicationId, user: req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      res.jsonp(application)
    }
  })
}

exports.deleteApplication = function deleteApplication (req, res, next) {
  Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      application.remove(function () {
        res.jsonp({code: 200, msg: 'done'})
      })
    }
  })
}

exports.addSimpleAPIKey = function addSimpleAPIKey (req, res, next) {
  Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      var apikey = new SimpleApiKey()
      apikey.application = application._id
      // jshint -W106
      apikey.activated_by = req.user._id
      // jshint +W106

      apikey.save(function (err) {
        if (err) {
          res.send(500, err)
        } else {
          res.jsonp(apikey)
        }
      })
    }
  })
}

exports.listSimpleAPIKeys = function listSimpleAPIKeys (req, res, next) {
  Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      SimpleApiKey.find({application: application._id}, function (err, keys) {
        res.jsonp(keys)
      })
    }
  })
}

exports.listConsumers = function listConsumers (req, res, next) {
  Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      OauthConsumer.find({application: application._id}, function (err, consumers) {
        res.jsonp(consumers)
      })
    }
  })
}

exports.addConsumer = function addConsumer (req, res, next) {
  Application.findOne({_id: req.params.applicationId, 'users._id': req.user._id}, function (err, application) {
    if (err) {
      res.send(500, err)
    } else if (!application) {
      res.send(404, 'Not found')
    } else {
      var consumer = new OauthConsumer(req.body)
      consumer.application = application._id

      // jshint -W106
      delete consumer.created_at
      delete consumer.updated_at
      // jshint +W106

      consumer.save(function (err) {
        if (err) {
          res.send(500, err)
        } else {
          res.jsonp(consumer)
        }
      })
    }
  })
}
