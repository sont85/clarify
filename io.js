'use strict';
var mongoose = require('mongoose');
var Teacher = require('./models/teacherSchema');
var Question = require('./models/questionSchema');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/clarity');

var result = {};
var room = {};
module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');

    socket.on('chat message', function(text, name, roomId){
      Teacher.findById(roomId, function(err, teacher){
        teacher.chat.length >= 25? teacher.chat.pop() : null;
        teacher.chat.unshift({text: text, name: name});
        teacher.save();
        console.log(teacher.chat);
        io.sockets.to(roomId).emit('message', teacher.chat);
      });
    });

    socket.on('join room', function(name, roomId){
      Teacher.findById(roomId, function(err, teacher){
        socket.join(roomId, function(){
          room[roomId] = room[roomId] || [];
          room[roomId].push(name);
          socket.currentRoom = roomId;
          socket.userName = name;
          console.log('join name', socket.userName);
          // var numberOfUser = Object.keys(io.sockets.adapter.rooms[roomId]).length;
          io.sockets.to(roomId).emit('stored messages and users', teacher.chat , room[roomId]);
        });
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
      if (letter !== 'null') {
        result[roomId][letter] ++;
      }
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

    socket.on('disconnect', function(){
      console.log(socket);
      console.log('disconnect room', this.currentRoom);
      if (this.currentRoom) {
        var index = room[this.currentRoom].indexOf(this.userName);
        room[this.currentRoom].splice(index, 1);
        io.sockets.to(this.currentRoom).emit('leave room', room[this.currentRoom]);
      }
    });
  });
};
