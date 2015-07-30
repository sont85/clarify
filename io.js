
module.exports = function(io) {
  io.on('connection', function(socket){
    console.log('user connected');
    io.emit('users count', io.engine.clientsCount);
    io.emit('hello', 'hello world');
    socket.on("answers", function(answer){
      console.log(answer);
    });
  });
}
