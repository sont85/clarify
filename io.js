'use strict';
var mongoose = require('mongoose');
var Teacher = require('./models/teacherSchema');
var Question = require('./models/questionSchema');
mongoose.connect('mongodb://localhost/clarity');

var result = {};

module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');
    socket.emit('users count', io.engine.clientsCount);

    socket.on('chat message', function(message, roomId){
      console.log(message);
      console.log(roomId);
      io.sockets.to(roomId).emit('message', message);
    });

    socket.on('join', function(roomId){
      socket.join(roomId, function(){
        var numberOfUser = Object.keys(io.sockets.adapter.rooms[roomId]).length;
        io.sockets.to(roomId).emit('user in room', numberOfUser);
      });

    });

    socket.on('answers', function(truthy, letter, roomId){
      result[roomId] = result[roomId] || {
        true : 0,
        false: 0,
        null: 0,
        total: 0,
        A: 0,
        B: 0,
        C: 0,
        D: 0
      };
      result[roomId].total ++;
      result[roomId][letter] ++;
      result[roomId][truthy] ++;
      var users = io.sockets.adapter.rooms[roomId];
      var totalStudent = Object.keys(users).length - 1;
      if (result[roomId].total === totalStudent) {
        io.sockets.in(roomId).emit('result', result[roomId]);
        console.log(result);
        result[roomId] = null;
      }
    });

    socket.on('startTest', function(question, roomId) {
      socket.broadcast.to(roomId).emit('currentTestQuestion', question);
    });
  });
};
