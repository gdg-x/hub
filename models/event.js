'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// jshint -W106
var EventSchema = new Schema({
  _id: String,
  chapter: {type: String, ref: 'Chapter'},
  start: Date,
  end: Date,
  geo: {lng: Number, lat: Number},
  about: String,
  participants: Number,
  timezone: String,
  allDay: Boolean,
  location: String,
  title: String,
  iconUrl: String,
  eventUrl: String,
  tags: [{type: String, ref: 'Tag'}],
  created_at: Date,
  updated_at: Date
});

EventSchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});
// jshint +W106

EventSchema.index({geo: '2dsphere'});

mongoose.model('Event', EventSchema);
