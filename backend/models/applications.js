'use strict'

var mongoose = require('mongoose'),
  Schema = mongoose.Schema

// jshint -W106
var ApplicationSchema = new Schema({
  name: String,
  homepage: String,
  logo: String,
  users: [{_id: {type: String, ref: 'User'}, level: {type: String, default: 'read'}}],
  updated_at: Date,
  created_at: Date
})

ApplicationSchema.pre('save', function (next) {
  this.updated_at = new Date()
  if (!this.created_at) {
    this.created_at = new Date()
  }
  next()
})
// jshint +W106

ApplicationSchema.pre('remove', function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  mongoose.model('SimpleApiKey').remove({application: this._id}).exec()
  mongoose.model('OauthConsumer').remove({application: this._id}).exec()
  next()
})

mongoose.model('Application', ApplicationSchema)
