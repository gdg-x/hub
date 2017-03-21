'use strict'

const router = require('express').Router()
router.use('/admin', require('./admin'))
router.use('/applications', require('./applications'))
router.use('/chapters', require('./chapters'))
router.use('/events', require('./events'))
router.use('/frisbee', require('./frisbee'))
router.use('/health', require('./health'))
router.use('/metrics', require('./metrics'))
router.use('/tags', require('./tags'))
router.use('/user', require('./user'))
module.exports = router
