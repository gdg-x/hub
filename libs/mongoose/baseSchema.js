var mongoose = require('mongoose');
var IdentityCounter = mongoose.model('IdentityCounter');
var shortId = require('shortid');

var baseSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  no: {
    type: Number,
    default: 0,
    required: true,
    index: true
  }
});
baseSchema.options.toJSON = {
  transform: function (doc, ret) {
    var fields = '__v __t isDeleted'.split(' ');
    fields.forEach(function (e) {
      if (ret && ret[e]) {
        delete ret[e];
      }
    });
    return ret;
  }
};
baseSchema.pre('save', function (next) {
  var self = this;
  if (self.updatedAt) {
    self.updatedAt = new Date();
  }
  if (!self.isNew) {
    return next();
  }
  IdentityCounter.findOneAndUpdate(
    {model: self.constructor.modelName},
    {$inc: {count: 1}},
    {upsert: true},
    function (err, counter) {
      if (err) {
        return next(err);
      }
      self.no = counter.count;
      return next();
    });
});

module.exports = baseSchema;
