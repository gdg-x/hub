'use strict'

const router = require('express').Router()
const controller = require('../../controllers/user')
const mw = require('../../services/middleware')

router.route('/')
  .get(mw.auth(), controller.list)

module.exports = router
