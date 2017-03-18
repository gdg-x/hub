'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// jshint -W106
var ChapterSchema = new Schema({
  _id: {type: String, required: true},
  name: {type: String, required: true},
  city: {type: String, required: true},
  state: String,
  country: { type: String, ref: 'Country' },
  geo: { lng: Number, lat: Number },
  group_type: String,
  status: {type: String, required: true},
  site: String,
  organizers: [{ type: String, ref: 'User' }],
  updated_at: {type: Date, default: Date.now},
  created_at: { type: Date, default: Date.now}
})

ChapterSchema.pre('save', function (next) {
  // Update the timestamp
  this.updatedOn = Date.now()
  return next()
})
// jshint +W106

ChapterSchema.index({ geo: '2dsphere' })

module.exports = mongoose.model('Chapter', ChapterSchema)
