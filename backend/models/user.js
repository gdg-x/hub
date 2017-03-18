'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// jshint -W106
var UserSchema = new Schema({
  _id: {type: String, required: true},
  email: {type: String, required: true},
  roles: [{ type: String, ref: 'Role' }],
  gcm: [String],
  gcm_notification_key: String,
  home_gdg: { type: String, ref: 'Chapter' },
  expires_at: Date,
  updated_at: {type: Date, default: Date.now},
  created_at: { type: Date, default: Date.now}
})

UserSchema.pre('save', function (next) {
  // Update the timestamp
  this.updatedOn = Date.now()
  return next()
})

// jshint +W106

module.exports = mongoose.model('User', UserSchema)
