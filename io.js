'use strict';
var mongoose = require('mongoose');
var Teacher = require('./models/teacherSchema');
var Point = require('./models/pointSchema');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/clarity');

var result = {};
var room = {};
module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');

    socket.on('chat message', function(text, name, roomId){
      Teacher.findById(roomId, function(err, teacher){
        teacher.chat.length >= 25? teacher.chat.pop(): null;
        teacher.chat.unshift({text: text, name: name});
        teacher.save();
        console.log(teacher.chat);
        io.sockets.to(roomId).emit('message', teacher.chat);
      });
    });

    socket.on('join room', function(name, roomId, studentId){
      Teacher.findById(roomId, function(err, teacher){
        room[roomId] = room[roomId] || [];
        var user = {name: name, point: 'N/A'};
        if (socket.currentRoom) {
          io.sockets.to(roomId).emit('stored messages and users', teacher.chat , room[roomId]);
        } else {
          if (studentId) {
            Point.findOne({studentId: studentId, teacherId: roomId}, function(err, pointData) {
              user.point = pointData.points;
              emitMessagePoint(socket, name, roomId, teacher, user);
            });
          } else {
            emitMessagePoint(socket, name, roomId, teacher, user);
          }
        }
      });
    });
    function emitMessagePoint(socket, name, roomId, teacher, user){
      room[roomId].unshift(user);
      socket.join(roomId, function(){
        socket.currentRoom = roomId;
        socket.userName = name;
        io.sockets.to(roomId).emit('stored messages and users', teacher.chat , room[roomId]);
      });
    }

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
      io.sockets.to(roomId).emit('start question', question);
    });

    socket.on('leaving room', function(){
      leavingRoom(this);
    });
    socket.on('disconnect', function(){
      leavingRoom(this);
    });
    function leavingRoom(socket) {
      if (socket.currentRoom) {
        var index = room[socket.currentRoom].indexOf(socket.userName);
        room[socket.currentRoom].splice(index, 1);
        socket.leave(socket.currentRoom);
        io.sockets.to(socket.currentRoom).emit('leave room', room[socket.currentRoom]);
        socket.currentRoom = null;
      }
    }
  });
};
