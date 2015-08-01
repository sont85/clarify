var mongoose = require('mongoose');
var questionSchema = mongoose.Schema({
  listName: String,
  list : [{
      question : String,
      answer: String,
      time: Number,
      choiceA: String,
      choiceB: String,
      choiceC: String,
      choiceD: String,
      choiceE: String
    }],
  createdBy: {type: mongoose.Schema.ObjectId}
});

module.exports = mongoose.model('Question', questionSchema);
