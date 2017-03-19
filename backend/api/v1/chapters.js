'use strict'

const router = require('express').Router()
const controller = require('../../controllers/chapters')

router.route('/')
  .get(controller.listChapters)

router.route('/:country')
  .get(controller.listChaptersForCountry)

router.route('/near/:lat/:lng/:maxDistance')
  .get(controller.listChaptersNearby)

router.route('/:chapterId')
  .get(controller.getChapter)

module.exports = router
