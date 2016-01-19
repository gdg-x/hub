var mongoose = require('mongoose');
var IdentityCounter = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  });
mongoose.model('IdentityCounter', IdentityCounter);
