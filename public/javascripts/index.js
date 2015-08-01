'use strict';
$(document).foundation();
var socket = io.connect('http://localhost:3000');
var app = angular.module('app',['ui.router']);


app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('allQuestion', {
      url: '/',
      templateUrl: '../html/allQuestion.html',
      controller: 'TeacherCtrl'
    })
    .state('newQuestion', {
      url: '/newQuestion',
      templateUrl: '../html/newQuestion.html',
      controller: 'TeacherCtrl'
    })
    .state('questionList', {
      url: '/questionList',
      templateUrl: '../html/questionList.html',
      controller: 'TeacherCtrl'
    });
});

app.service('TeacherService', function($http) {
  this.addSet = function(newSetName){
    $http.post('http://localhost:3000/teacher/set', { setName: newSetName })
    .success(function(response){
      console.log(response);
    }).catch(function(err){
      console.log(err);
    });
  };
  this.addQuestion = function(newQuestion, setId){
    console.log(setId)
    console.log(newQuestion)
    $http.post('http://localhost:3000/teacher/question/'+ setId, newQuestion)
    .success(function(response){
      console.log(response);
    }).catch(function(err){
      console.log(err);
    });
  };
});
app.service('SocketService', function() {
  this.emit = function(name, data) {
    socket.emit(name, data);
  };
});
app.controller('MainCtrl', function($scope, $state, TeacherService, SocketService) {

  socket.on('users count', function(msg){
    console.log(msg);
  });

  socket.on('currentTestQuestion', function(question) {
    console.log(question);
    $scope.$apply(function() {
      $scope.time = question.time;
      $scope.timeOut = false;
      $scope.currentQuestion = question;
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
      if (!$scope.studentAnswer) {
        socket.emit('answers', 'null');
      }
    }, question.time * 1000);
  });

  socket.on('result', function(msg){
    console.log(msg);
    console.log(msg.true / msg.total);
  });

  $scope.submitAnswer = function() {
    console.log($scope.studentAnswer);
    socket.emit('answers', $scope.currentQuestion.answer === $scope.studentAnswer);
  };
});

app.controller('TeacherCtrl', function($scope, TeacherService, $state){
  socket.on('result', function(msg){
    console.log(msg);
    console.log(msg.true / msg.total);
  });

  socket.on('allQuestion', function(allQuestion){
    $scope.$apply(function(){
      $scope.allQuestion = allQuestion;
    });
  });

  $scope.addQuestion = function() {
    TeacherService.addQuestion($scope.newQuestion, $scope.currentSet._id);
    $scope.newQuestion = "";
  };

  $scope.startTest = function(question) {
    socket.emit('startTest', question);
  };
  $scope.editList = function(list) {
    $scope.currentSet = list;
    console.log($scope.currentSet);
    $state.go('questionList');
  };
  $scope.addSet = function(){
    TeacherService.addSet($scope.newSetName);
    $scope.newSetName ='';
  };
});
