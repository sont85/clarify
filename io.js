'use strict';
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/clarity');

var questionSchema = mongoose.Schema({
  list : [{
      question : String,
      answer: String,
      time: Number,
      choiceA: String,
      choiceB: String,
      choiceC: String,
      choiceD: String,
      choiceE: String
    }]
});

var Question = mongoose.model('Question', questionSchema);


var data = {
  question : 'What shape is the world?',
  answer: 'C',
  time: 5,
  choiceA: 'world is flat',
  choiceB: 'world is square',
  choiceC: 'world is round',
  choiceD: 'world is triangle'
};

// var question = new Question();
// question.list.push(data);
// question.save();





var result = {
  true : 0,
  false: 0,
  null: 0,
  total: 0
};

module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    Question.findOne({}, function(err, question){
      socket.emit('question', question);
    });

    console.log('user connected');
    socket.emit('users count', io.engine.clientsCount);

    socket.on('answers', function(answer){
      result.total ++
      result[answer] ++;
      io.sockets.emit('result', result);
      console.log(result);
    });
    socket.on('newQuestion', function(newQuestion){
      Question.findOne({}, function(err, question){
        question.list.push(newQuestion);
        question.save();
        socket.emit('question', question);
      });
    });

    socket.on('startTest', function(index) {
      socket.broadcast.emit('questionIndex', index)
    });
  });
};
