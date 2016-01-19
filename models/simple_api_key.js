'use strict';

var mongoose = require('mongoose'),
  uuid = require('node-uuid'),
  Schema = mongoose.Schema;

// jshint -W106
var SimpleApiKeySchema = new Schema({
  _id: String,
  application: {type: String, ref: 'Application'},
  activated_by: {type: String, ref: 'User'},
  updated_at: Date,
  created_at: Date
});

SimpleApiKeySchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  if (!this._id) {
    this._id = uuid.v4();
  }
  next();
});
// jshint +W106

mongoose.model('SimpleApiKey', SimpleApiKeySchema);
