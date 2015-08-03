(function(){
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');
  app.controller('StudentCtrl', function($scope, $state, TeacherService, StudentService) {
    StudentService.allTeacher()
    .success(function(teachers){
      $scope.teachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

    StudentService.myTeacher()
    .success(function(teachers){
      console.log(teachers);
      $scope.myTeachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

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
    $scope.addTeacher = function(teacher){
      StudentService.addTeacher(teacher);
    };

    $scope.enterRoom = function(teacher){
      socket.emit('join', '55bebc7f2a5dfdda73ddd74f');
    };

    $scope.submitAnswer = function() {
      console.log($scope.studentAnswer);
      socket.emit('answers', $scope.currentQuestion.answer === $scope.studentAnswer);
    };
  });

  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state){

    socket.on('result', function(msg){
      console.log(msg);
      console.log(msg.true / msg.total);
    });

    TeacherService.allQuestions()
    .success(function(allQuestion){
      console.log(allQuestion);
      $scope.allQuestion = allQuestion;
    }).catch(function(err){
      console.log(err);
    });
    $scope.addSet = function(){
      TeacherService.addSet($scope.newSetName);
      $scope.newSetName ='';
    };
    $scope.editList = function(set) {
      TeacherService.currentSet = set;
      $location.url('/teacher/questionList/'+set._id);
    };
    $scope.deleteSet = function(set) {
      TeacherService.deleteSet(set);
    };
  });
  app.controller('QuestionCtrl', function($scope, TeacherService, $location, $state, $stateParams){
    TeacherService.getCurrentSet($stateParams.setId)
    .success(function(currentSet){
      TeacherService.currentSet = currentSet;
      $scope.currentSet = currentSet;
      console.log(currentSet.createdBy);
      socket.emit('join', currentSet.createdBy);
    }).catch(function(err){
      console.log(err);
    });
    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion);
      $scope.newQuestion = '';
    };
    $scope.startTest = function(question) {
      socket.emit('startTest', question);
    };
    $scope.deleteQuestion = function(question){
      console.log(question);
      console.log(TeacherService.currentSet);
      TeacherService.deleteQuestion(question);
    };
  });
  app.controller('MainCtrl', function($scope, $http){
    $scope.registerUser = function() {
      $http.post('http://localhost:3000/register', {type: $scope.type})
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.error(err);
      });
    };
  });
})();
