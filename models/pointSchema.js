var mongoose = require('mongoose');

var pointSchema = mongoose.Schema({
  studentId: {type: mongoose.Schema.ObjectId},
  studentName: String,
  teacherId: String,
  teacherName: String,
  points: Number
});

module.exports = mongoose.model('Point', pointSchema);
