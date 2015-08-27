(function(){
  'use strict';
  var app = angular.module('clarity.service.socketIO', []);
  app.service('IOService', function(){
    var socket = io.connect('http://localhost:3000');
    // var socket = io.connect('https://clarity.herokuapp.com');
    this.emit = function(event, value1, value2, value3){
      socket.emit(event, value1, value2, value3);
    };
    this.on = function(event, cb){
      socket.on(event, cb);
    };
  });
})();
