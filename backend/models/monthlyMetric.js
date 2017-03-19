'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var MonthlyMetricSchema = new Schema({
  type: String,
  year: Number,
  subject: String,
  subjectType: String,
  numSamples: { type: Number, default: 0 },
  totalSamples: { type: Number, default: 0 },
  values: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
    6: { type: Number, default: 0 },
    7: { type: Number, default: 0 },
    8: { type: Number, default: 0 },
    9: { type: Number, default: 0 },
    10: { type: Number, default: 0 },
    11: { type: Number, default: 0 },
    12: { type: Number, default: 0 }
  }
})

MonthlyMetricSchema.index({ subject: 1, type: 1, year: -1 })

module.exports = mongoose.model('MonthlyMetric', MonthlyMetricSchema)
