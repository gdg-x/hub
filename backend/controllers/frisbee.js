'use strict'

/**
 * Sets your Home GDG
 */
exports.userHome = function userHome (req, res, next) {
  res.charset = 'utf-8'

  if (!req.body.homeGdg) {
    return res.send(500, 'Missing homeGdg.')
  }

  Chapter.findOne({
    _id: req.body.homeGdg
  }).exec(function (err, chapter) {
    if (!chapter) {
      res.send(404, 'Not found')
    } else {
      // jshint -W106
      req.user.home_gdg = req.body.homeGdg
      req.user.save(function (err, user) {
        delete user.gcm
        delete user.gcm_notification_key
        delete user.updated_at
        delete user.created_at
        res.jsonp(user)
      })
    // jshint +W106
    }
  })
}

/**
 * Register a device for GCM push messages with Frisbee
 */
exports.gcmRegister = function gcmRegister (req, res, next) {
  var reg = req.body
  var notificationKeyReq

  if (!reg.registrationId || reg.registrationId === '') {
    return res.send(500, 'Uh oh. Empty registrationId')
  }

  if (req.user.gcm.indexOf(reg.registrationId) === -1) {
    req.user.gcm.push(reg.registrationId)

    if (!req.user.gcm_notification_key) {
      notificationKeyReq = {
        'operation': 'create',
        'notification_key_name': 'gdg-frisbee-' + req.user._id,
        'registration_ids': [reg.registrationId]
      }

      request.post('https://android.googleapis.com/gcm/notification')
        .send(notificationKeyReq)
        .set('project_id', config.keys.google.gcm.gcmId)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'key=' + config.keys.google.simpleApiKey)
        .retry(5)
        .end(function (err, result) {
          if (err) {
            console.error('fail magoo: ' + err + ', ' + result)
            return res.send(500, 'Uh oh this failed.')
          } else {
            var ress = result.body
            console.log2(ress)
            req.user.gcm_notification_key = ress.notification_key
            req.user.save()
            return res.jsonp({
              status: 200,
              msg: 'registered.',
              notificationKey: req.user.gcm_notification_key
            })
          }
        })
    } else {
      notificationKeyReq = {
        'operation': 'add',
        'notification_key_name': 'frisbee-' + req.user._id,
        'notification_key': req.user.gcm_notification_key,
        'registration_ids': [reg.registrationId]
      }

      request.post('https://android.googleapis.com/gcm/notification')
        .send(notificationKeyReq)
        .set('project_id', config.keys.google.gcm.gcmId)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'key=' + config.keys.google.simpleApiKey)
        .retry(5)
        .end(function (err, result) {
          if (err) {
            console.error('fail magoo: ' + err + ', ' + result)
            return res.send(500, 'Uh oh this failed.')
          } else {
            var ress = result.body
            console.log2(ress)
            req.user.save()
            return res.jsonp({
              status: 200,
              msg: 'registered.',
              notificationKey: req.user.gcm_notification_key
            })
          }
        })
    }
  } else {
    return res.jsonp({
      status: 200,
      msg: 'registered.',
      notificationKey: req.user.gcm_notification_key
    })
  }
}

/**
 * Unregister a device for GCM push messages with Frisbee
 */
exports.gcmUnregister = function gcmUnregister (req, res, next) {
  var reg = req.body
  var idx = req.user.gcm.indexOf(reg.registrationId)
  if (idx !== -1) {
    req.user.gcm.splice(idx, 1)

    // jshint -W106
    if (req.user.gcm_notification_key) {
      process.nextTick(function () {
        var notificationKeyReq = {
          'operation': 'remove',
          'notification_key_name': 'frisbee-' + req.user._id,
          'notification_key': req.user.gcm_notification_key,
          'registration_ids': [reg.registrationId]
        }

        request.post('https://android.googleapis.com/gcm/notification')
          .send(notificationKeyReq)
          .set('project_id', config.keys.google.gcm.gcmId)
          .set('Content-Type', 'application/json')
          .set('Authorization', 'key=' + config.keys.google.simpleApiKey)
          .retry(5)
          .end(function (err, result) {
            if (err) {
              console.error('fail magoo: ' + err + ', ' + result)
              return res.send(500, 'Uh oh this failed.')
            } else {
              if (req.user.gcm.length === 0) {
                req.user.gcm_notification_key = undefined
              }
              req.user.save()
              return res.jsonp({
                status: 200,
                msg: 'unregistered.'
              })
            }
          })
      })
    }
  // jshint +W106
  } else {
    return res.send(404, 'Not found')
  }
}
