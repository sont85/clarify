'use strict';
var mongoose = require('mongoose');
var Teacher = require('./models/teacherSchema');
var Question = require('./models/questionSchema');
mongoose.connect('mongodb://localhost/clarity');

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

    socket.on('join', function(teacherId){
      console.log('------teacherId--------',teacherId);
      socket.join(teacherId);
    });


    socket.on('answers', function(answer){
      result.total ++;
      result[answer] ++;
      io.sockets.emit('result', result);
      console.log(result);
    });

    socket.on('startTest', function(question) {
      socket.broadcast.to('55bebc7f2a5dfdda73ddd74f').emit('currentTestQuestion', question);
    });
  });
};
