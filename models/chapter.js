var mongoose = require('mongoose');
var baseSchema = require('../libs/mongoose/baseSchema');

var ChapterSchema = baseSchema.extend({
  _id: String,
  name: String,
  city: String,
  state: String,
  country: {type: String, ref: 'Country'},
  geo: {lng: Number, lat: Number},
  group_type: String,
  status: String,
  site: String,
  organizers: [{type: String, ref: 'User'}]
});

ChapterSchema.index({geo: '2dsphere'});

mongoose.model('Chapter', ChapterSchema);
