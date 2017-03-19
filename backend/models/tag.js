'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// jshint -W106
var TagSchema = new Schema({
  _id: String,
  title: String,
  description: String,
  icon: String,
  color: String,
  created_at: Date,
  updated_at: Date
})

TagSchema.pre('save', function (next) {
  this.updated_at = new Date()
  if (!this.created_at) {
    this.created_at = new Date()
  }
  next()
})
// jshint +W106

module.exports = mongoose.model('Tag', TagSchema)
