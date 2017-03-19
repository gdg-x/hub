'use strict'

exports.tasks = function tasks (req, res, next) {
  risky.sendTask(req.body.task_type, req.body.params,
    function (err, id) {
      if (err) {
        return res.send(500, 'Not executing task.')
      }

      res.jsonp({msg: 'task_runs', taskId: id})
    },
    null, true)
}

exports.cluster = function cluster (req, res, next) {
  res.jsonp(risky.getCluster())
}

exports.flushCache = function flushCache (req, res, next) {
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
}
