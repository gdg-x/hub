'use strict'

const router = require('express').Router()
const controller = require('../../controllers/metrics')

router.route('/')
  .get(controller.listMetricTypes)

module.exports = router
