'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uuid = require('node-uuid')

// jshint -W106
var SimpleApiKeySchema = new Schema({
  _id: String,
  application: { type: String, ref: 'Application' },
  activated_by: { type: String, ref: 'User'},
  updated_at: Date,
  created_at: Date
})

SimpleApiKeySchema.pre('save', function (next) {
  this.updated_at = new Date()
  if (!this.created_at) {
    this.created_at = new Date()
  }
  if (!this._id) {
    this._id = uuid.v4()
  }
  next()
})
// jshint +W106

module.exports = mongoose.model('SimpleApiKey', SimpleApiKeySchema)
