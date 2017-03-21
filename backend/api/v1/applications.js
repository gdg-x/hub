'use strict'

const router = require('express').Router()
const controller = require('../../controllers/applications')
const mw = require('../../services/middleware')

router.route('/applications')
  .get(mw.auth(), controller.listApplications)
  .post(mw.auth(), controller.addApplication)

router.route('/applications/:applicationId')
  .get(mw.auth(), controller.getApplication)
  .delete(mw.auth(), controller.deleteApplication)

router.route('/applications/:applicationId/simpleapikeys')
  .get(mw.auth(), controller.listSimpleAPIKeys)
  .post(mw.auth(), controller.addSimpleAPIKey)

router.route('/applications/:applicationId/consumers')
  .get(mw.auth(), controller.listConsumers)
  .post(mw.auth(), controller.addConsumer)

module.exports = router
