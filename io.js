'use strict';
var data = {
  question : 'What shape is the world?',
  answer: 'C',
  choiceA: 'world is flat',
  choiceB: 'world is square',
  choiceC: 'world is round',
};




module.exports = function(io) {
  io.sockets.on('connection', function(socket){
    console.log('user connected');
    socket.emit('users count', io.engine.clientsCount);
    socket.emit('question', data);
    socket.on("answers", function(answer){
      console.log(answer);
    });
  });
}
