'use strict'

const router = require('express').Router()
const controller = require('../../controllers/events')
const mw = require('../../services/middleware')

router.route('/')
  .get(controller.listEvents)

router.route('/past')
  .get(controller.listPastEvents)

router.route('/upcoming')
  .get(controller.listUpcomingEvents)

router.route('/today')
  .get(controller.listEventsHappeningToday)

router.route('/now')
  .get(controller.listEventsHappeningNow)

router.route('/stats')
  .get(controller.listEventsStats)

router.route('/:eventId/nearby')
  .get(controller.listEventsNearby)

router.route('/near/:lat/:lng/:maxDistance')
  .get(controller.listEventsCloseTo)

router.route('/year/:year')
  .get(controller.listEventsForYear)

router.route('/year/:year/:month')
  .get(controller.listEventsForYearMonth)

router.route('/tags')
  .get(controller.listEventsTags)

router.route('/:eventId')
  .get(controller.getEvent)

router.route('/tag/:tag')
  .get(controller.listEventsForTag)

router.route('/tag/:tag/upcoming')
  .get(controller.listUpcomingEventsForTag)

router.route('/tag/:tag/:start/:end')
  .get(controller.listEventsWithinDateRangeForTag)

router.route('/:start/:end')
  .get(controller.listEventsWithinDateRange)

router.route('/:chapterId/events')
  .get(controller.listEventsForChapter)

router.route('/:chapterId/events/upcoming')
  .get(controller.listUpcomingEvents)

router.route('/:chapterId/events/past')
  .get(controller.listPastEventsForChapter)

router.route('/:chapterId/events/month')
  .get(controller.listCurrentMonthEventsForChapter)

router.route('/:chapterId/events/year/:year/:month')
  .get(controller.listCurrentMonthYearEventsForChapter)

router.route('/:chapterId/events/:start/:end')
  .get(controller.listDateRangeEventsForChapter)

router.route('/:chapterId/events/tag/:tag')
  .get(controller.listTaggedEventsForChapter)

router.route('/:chapterId/events/stats')
  .get(controller.getEventsStatsForChapter)

module.exports = router
