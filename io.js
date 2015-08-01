'use strict';
var mongoose = require('mongoose');
var Teacher = require('./models/teacherSchema');
var Question = require('./models/questionSchema');
mongoose.connect('mongodb://localhost/clarity');

var data = {
  question : 'What shape is the world111?',
  answer: 'C',
  time: 5,
  choiceA: 'world is flat1',
  choiceB: 'world is square1',
  choiceC: 'world is round1',
  choiceD: 'world is triangle1'
};

//
// Teacher.create({
//   displayName: 'Son Truong',
//   email: 'son@gmail.com'
// }, function(err, teacher){
//   if (teacher) {
//     Question.create({
//       listName: "QuestionSet1",
//       list: [data],
//       createdBy: teacher._id
//     }, function(err, question) {
//       teacher.questionsList.push(question._id);
//       console.log('+++++++++', teacher);
//       console.log(question);
//       teacher.save();
//     });
//   }
// });


// Teacher.findOne({email: 'son@gmail.com'}).populate("questionsList").exec(function(err, teacher){
//   console.log(teacher.questionsList);
// })


var result = {
  true : 0,
  false: 0,
  null: 0,
  total: 0
};

module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');
    socket.emit('users count', io.engine.clientsCount);

    Question.find({createdBy: '55bc42d5a6951cdac15f0926'}, function(err, allQuestion){
      socket.emit('allQuestion', allQuestion);
    });

    socket.on('answers', function(answer){
      result.total ++;
      result[answer] ++;
      io.sockets.emit('result', result);
      console.log(result);
    });

    socket.on('startTest', function(question) {
      socket.broadcast.emit('currentTestQuestion', question);
    });
  });
};
