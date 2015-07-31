'use strict';
var app = angular.module('app',[]);
var socket = io.connect('http://localhost:3000');
app.controller('MainCtrl', function($scope) {

  socket.on('users count', function(msg){
    console.log(msg);
  });
  socket.on('result', function(msg){
    console.log(msg);
    console.log(msg.true / msg.total);
  });
  socket.on('question', function(question){
    $scope.$apply(function(){
      $scope.questionList = question.list;
      console.log(question);
    });
  });

  socket.on('questionIndex', function(index) {
    $scope.$apply(function() {
      $scope.time = $scope.questionList[index].time;
      $scope.timeOut = false;
      $scope.question = $scope.questionList[index];
      $scope.answer = null;

    });
    var timer = setInterval(function(){
      $scope.$apply(function(){
        $scope.time --;
      });
    }, 1000);

    setTimeout(function(){
      clearInterval(timer);
      $scope.$apply(function() {
        $scope.timeOut = true;
        $scope.time = null;
      });
      if (!$scope.answer) {
        socket.emit('answers', 'null');
      }
    }, $scope.questionList[index].time * 1000);
  });

  $scope.submitNewQuestion = function() {
    socket.emit('newQuestion', $scope.newQuestion);
  };
  $scope.submitAnswer = function() {
    socket.emit('answers', $scope.question.answer === $scope.answer);
  };
  $scope.startTest = function(index) {
    socket.emit('startTest', index);
  };
});
