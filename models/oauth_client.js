'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// jshint -W106
var OauthClientSchema = new Schema({
  consumer: {type: Schema.Types.ObjectId, ref: 'OauthConsumer'},
  user: {type: String, ref: 'User'},
  request_token: {type: String, index: {unique: true}},
  request_token_secret: String,
  access_token: {type: String, index: {unique: true, sparse: true}},
  access_token_secret: String,
  verifier: String,
  approved: {type: Boolean, default: false},
  updated_at: Date,
  created_at: Date
});

OauthClientSchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});
// jshint +W106

mongoose.model('OauthClient', OauthClientSchema);
