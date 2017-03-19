'use strict'

const router = require('express').Router()
const controller = require('../../controllers/frisbee')
const mw = require('../../services/middleware')

router.route('/')
  .put(mw.frisbee(), controller.userHome)

router.route('/gcmRegister')
  .post(mw.frisbee(), controller.gcmRegister)

router.route('/gcmUnregister')
  .post(mw.frisbee(), controller.gcmUnregister)

module.exports = router
