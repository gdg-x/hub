'use strict'

const router = require('express').Router()
router.use('/health', require('./health'))
router.use('/user', require('./user'))
router.use('/admin', require('./admin'))
module.exports = router
