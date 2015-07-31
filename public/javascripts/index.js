'use strict';
var app = angular.module('app',[]);
var socket = io.connect('http://localhost:3000');
app.controller('MainCtrl', function($scope) {

  socket.on('users count', function(msg){
    console.log(msg);
  });
  socket.on('result', function(msg){
    console.log(msg.correct);
    console.log(msg.wrong)
    console.log(msg.correct / msg.total)
  });
  socket.on('question', function(question){
    $scope.$apply(function(){
      $scope.questionList = question.list;
      console.log(question);
    });
  });

  socket.on('questionIndex', function(index) {
    $scope.$apply(function() {
      $scope.question = $scope.questionList[index];
    })
  });

  $scope.submitNewQuestion = function() {
    socket.emit("newQuestion", $scope.newQuestion);
  };

  $scope.submitAnswer = function() {
    console.log($scope.answer);
    socket.emit("answers", $scope.question.answer === $scope.answer);
  }

  $scope.startTest = function(index) {
    console.log(index)
    socket.emit('startTest', index)
  };

})
