'use strict';
var Teacher = require('./models/teacherSchema');
var Point = require('./models/pointSchema');

var result = {};
var room = {};
var testTaker = {}
module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');

    socket.on('get chat message', function(text, name, roomId){
      Teacher.findById(roomId, function(err, teacher){
        teacher.chat.length >= 25? teacher.chat.pop(): null;
        teacher.chat.unshift({text: text, name: name});
        teacher.save();
        io.sockets.to(roomId).emit('message', teacher.chat);
      });
    });
    socket.on('join room', function(name, roomId, studentId){
      Teacher.findById(roomId, function(err, teacher){
        room[roomId] = room[roomId] || [];
        var user = {name: name, point: 'T'};
        if (socket.currentRoom) {
          io.sockets.to(roomId).emit('all chat messages/users', teacher.chat , room[roomId]);
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
        io.sockets.to(roomId).emit('all chat messages/users', teacher.chat , room[roomId]);
      });
    }
    socket.on('number of test taker', function(testTakerName){
      testTaker[socket.currentRoom] = testTaker[socket.currentRoom] || [];
      testTaker[socket.currentRoom].push(testTakerName);
    });
    socket.on('answers', function(truthy, letter, roomId){
      result[roomId] = result[roomId] || {
        true : 0,
        false: 0,
        null: 0,
        total: [],
        A: 0,
        B: 0,
        C: 0,
        D: 0
      };
      result[roomId].total.push(socket.userName);
      if (letter !== 'null') {
        result[roomId][letter] ++;
      }
      result[roomId][truthy] ++;
      if (result[roomId].total.length === testTaker[roomId].length) {
        io.sockets.in(roomId).emit('result', result[roomId]);
        result[roomId] = null;
        testTaker[roomId] = null;
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
        var index;
        room[socket.currentRoom].forEach(function(item, i){
          if (item.name === socket.userName){
            index = i;
          }
        });
        room[socket.currentRoom].splice(index, 1);
        if (testTaker[socket.currentRoom]) {
          var index2 = testTaker[socket.currentRoom].indexOf(socket.userName);
          testTaker[socket.currentRoom].splice(index2, 1);
        }
        if (result[socket.currentRoom]) {
          var index3 = result[socket.currentRoom].total.indexOf(socket.userName);
          if (index3 >= 0) {
            result[socket.currentRoom].total.splice(index3, 1);
          }
        }
        socket.leave(socket.currentRoom);
        io.sockets.to(socket.currentRoom).emit('leave room', room[socket.currentRoom]);
        socket.currentRoom = null;
      }
    }
  });
};
