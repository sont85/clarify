var mongoose = require('mongoose');
var questionSchema = mongoose.Schema({
  listName: String,
  list : [{
      question : {type: String, required: true},
      answer: {type: String, required: true},
      time: {type: Number, default: 30},
      choiceA: {type: String, required: true},
      choiceB: {type: String, required: true},
      choiceC: String,
      choiceD: String,
      choiceE: String
    }],
  createdBy: {type: mongoose.Schema.ObjectId}
});

module.exports = mongoose.model('Question', questionSchema);
