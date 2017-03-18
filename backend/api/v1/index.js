'use strict'

const router = require('express').Router()
router.use('/health', require('./health'))
module.exports = router
