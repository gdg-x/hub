'use strict'

const router = require('express').Router()
const controller = require('../../controllers/admin')
const mw = require('../../services/middleware')

router.route('/tasks')
  .post(mw.auth({roles: ['admin']}), controller.tasks)

router.route('/cluster')
  .post(mw.auth({roles: ['admin']}), controller.cluster)

router.route('/flushCache')
  .post(mw.auth({roles: ['admin']}), controller.flushCache)

module.exports = router
