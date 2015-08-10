var mongoose = require('mongoose');

var teacherSchema = mongoose.Schema({
  displayName: String,
  email: String,
  image: String,
  type: String,
  chat: [],
  questionsList : [{type: mongoose.Schema.ObjectId, ref: 'Question'}]
});

module.exports = mongoose.model('Teacher', teacherSchema);
