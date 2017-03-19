'use strict'

const router = require('express').Router()
const controller = require('../../controllers/admin')
const mw = require('../../services/middleware')
// mw.auth()

router.route('/')
  .get(controller.list)
  .post(jwt.mw, controller.new)

router.route('/:id')
  .get(controller.get)
  .put(jwt.mw, controller.update)
  .delete(jwt.mw, controller.delete)

router.param('id', controller.masterId)

module.exports = router

'use strict'

var redis = require('redis'),
  config = require('../../../config/config'),
  middleware = require('../../../middleware'),
  risky = require('../../../risky')

module.exports = function (app) {
  var redisClient = null

  app.route('post', '/admin/tasks', {summary: '-'},
    middleware.auth({roles: ['admin']}), function (req, res) {
      // jshint -W106
      risky.sendTask(req.body.task_type, req.body.params,
        function (err, id) {
          if (err) {
            return res.send(500, 'Not executing task.')
          }

          res.jsonp({msg: 'task_runs', taskId: id})
        },
        null, true)
    // jshint +W106
    })

  app.route('post', '/admin/tasks/cluster', {
    summary: '-'
  }, middleware.auth({roles: ['admin']}), function (req, res) {
    res.jsonp(risky.getCluster())
  })

  app.route('post', '/admin/cache/flush', {
    summary: '-'
  }, middleware.auth({roles: ['admin']}), function (req, res) {
    if (redisClient) {
      redisClient.keys('cacher:*', function (err, replies) {
        if (replies.length === 0) {
          res.jsonp({msg: 'nothing to flush', code: 404})
        } else {
          redisClient.del(replies, function (err) {
            if (err) {
              res.jsonp({msg: 'flush failed', code: 500})
            } else {
              res.jsonp({msg: 'flushed express cache', count: replies.length, code: 200})
            }
          })
        }
      })
    } else {
      res.jsonp({msg: 'not connected to redis', code: 500})
    }
  })
}
