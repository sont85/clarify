'use strict';
var app = angular.module('app',[]);
var socket = io.connect('http://localhost:3000');
app.controller('MainCtrl', function($scope) {
  socket.on('users count', function(msg){
    console.log(msg);
  });
  socket.on('question', function(question){
    $scope.$apply(function(){
      $scope.question = question;
      console.log($scope.question);
    });
  });

$scope.submitNewQuestion = function() {
  socket.emit("newQuestion", $scope.newQuestion);
}



  $scope.submitAnswer = function() {
    console.log($scope.answer);
    socket.emit("answers", $scope.answer);
  }

})
