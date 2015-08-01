'use strict';
$(document).foundation();
var socket = io.connect('http://localhost:3000');
var app = angular.module('app',['ui.router']);


app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('allQuestion', {
      url: '/',
      templateUrl: '../html/allQuestion.html'
    })
    .state('newQuestion', {
      url: '/newQuestion',
      templateUrl: '../html/newQuestion.html'
    })
    .state('questionList', {
      url: '/questionList',
      templateUrl: '../html/questionList.html'
    });
});

app.service('TeacherService', function($http) {
  this.addSet = function(newSetName){
    console.log(newSetName)
    $http.post('http://localhost:3000/teacher/addSet', newSetName)
    .success(function(response){
      console.log(response);
    }).catch(function(err){
      console.log(err);
    });
  };
});
app.controller('MainCtrl', function($scope, $state, TeacherService, $http) {

  socket.on('users count', function(msg){
    console.log(msg);
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



  socket.on('result', function(msg){
    console.log(msg);
    console.log(msg.true / msg.total);
  });

  socket.on('allQuestion', function(allQuestion){
    $scope.$apply(function(){
      $scope.allQuestion = allQuestion;
    });
  });

  $scope.submitAnswer = function() {
    socket.emit('answers', $scope.question.answer === $scope.answer);
  };

  $scope.submitNewQuestion = function() {
    socket.emit('newQuestion', $scope.newQuestion);
    $scope.newQuestion = '';
  };

  $scope.startTest = function(index) {
    socket.emit('startTest', index);
  };

  $scope.editList = function(list) {
    $scope.currentList = list;
    $state.go('questionList');
  };
  $scope.addSet = function(newSetName){
    $http.post('http://localhost:3000/student', newSetName)
    .success(function(response){
      console.log(response);
    }).catch(function(err){
      console.log(err);
    });
    // TeacherService.addSet(newSetName);
  };
});
