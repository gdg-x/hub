'use strict'

const router = require('express').Router()
const controller = require('../../controllers/user')

router.route('/')
  .get(controller.list)

module.exports = router

