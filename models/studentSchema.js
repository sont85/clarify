var mongoose = require('mongoose');

var studentSchema = mongoose.Schema({
  displayName: String,
  email: String,
  image: String,
  type: String,
  teacher : [{type: mongoose.Schema.ObjectId, ref: 'Teacher'}],
  points: [{type: mongoose.Schema.ObjectId, ref: 'Point'}]
});

module.exports = mongoose.model('Student', studentSchema);
