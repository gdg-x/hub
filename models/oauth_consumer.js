'use strict';

var mongoose = require('mongoose'),
  OauthClient = mongoose.model('OauthClient'),
  Schema = mongoose.Schema;

// jshint -W106
var OauthConsumerSchema = new Schema({
  application: {type: String, ref: 'Application'},
  consumer_key: {type: String, index: {unique: true}},
  consumer_secret: String,
  callback_url: String,
  required_permissions: [String],
  optional_permissions: [String],
  updated_at: Date,
  created_at: Date
});
OauthConsumerSchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});
// jshint +W106

OauthConsumerSchema.pre('remove', function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  OauthClient.remove({consumer: this._id}).exec();
  next();
});

mongoose.model('OauthConsumer', OauthConsumerSchema);
