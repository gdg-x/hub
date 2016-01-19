'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// jshint -W106
var CountrySchema = new Schema({
  _id: String,
  name: {type: String, index: true},
  nativeName: String,
  tld: [String],
  ccn3: {type: String, index: true},
  cca3: {type: String, index: true},
  currency: [String],
  callingCode: [String],
  capital: String,
  altSpellings: [String],
  relevance: String,
  region: String,
  subregion: String,
  language: [String],
  languageCodes: [String],
  population: Number,
  latlng: [Number],
  demonym: String,
  borders: [String],
  created_at: Date,
  updated_at: Date
});

CountrySchema.pre('save', function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});
// jshint +W106

mongoose.model('Country', CountrySchema);
