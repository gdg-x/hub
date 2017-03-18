'use strict'

const router = require('express').Router()
const controller = require('../../controllers/health')

router.route('/')
  .get(controller.echo)

module.exports = router
