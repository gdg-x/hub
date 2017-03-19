'use strict'

const router = require('express').Router()
const controller = require('../../controllers/tags')
const mw = require('../../services/middleware')

router.route('/')
  .get(controller.listTags)

router.route('/:tagId')
  .get(controller.getTag)
  .put(mw.auth({roles: ['admin']}), controller.updateTag)

module.exports = router
