(function(){
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');

  app.controller('StudentCtrl', function($scope, TeacherService, StudentService, $location) {
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
          socket.emit('answers', 'null', $scope.currentQuestion);
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
      socket.emit('join', teacher._id);
      StudentService.currentTeacher = teacher;
      $location.url('/student/room/'+teacher._id);
    };

    $scope.submitAnswer = function() {
      var result = $scope.currentQuestion.answer === $scope.studentAnswer;
      socket.emit('answers', result , StudentService.currentTeacher._id);
    };

      $(function () {
        $('#container').highcharts({
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: 'Browser market shares at a specific website, 2014'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Browser share',
                data: [
                    ['Firefox',   45.0],
                    ['IE',       26.8],
                    {
                        name: 'Chrome',
                        y: 12.8,
                        sliced: true,
                        selected: true
                    },
                    ['Safari',    8.5],
                    ['Opera',     6.2],
                    ['Others',   0.7]
                ]
            }]
        });
    });

  });

  app.controller('TeacherCtrl', function($scope, TeacherService, $location){
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
    $scope.linkToList = function(set) {
      TeacherService.currentSet = set;
      $location.url('/teacher/questionList/'+set._id);
    };
    $scope.deleteSet = function(set) {
      TeacherService.deleteSet(set);
    };
  });
  app.controller('QuestionListCtrl', function($scope, TeacherService, $location, $stateParams){
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
      var roomId = $scope.currentSet.createdBy;
      socket.emit('startTest', question, roomId);
    };
    $scope.linkToQuestion = function(question){
      TeacherService.currentQuestion = question;
      $location.url('teacher/question/'+question._id);
    };
  });
  app.controller('QuestionCtrl', function(TeacherService, $scope){
    $scope.currentQuestion = TeacherService.currentQuestion;
    $scope.deleteQuestion = function(){
      TeacherService.deleteQuestion($scope.currentQuestion);
    };
    $scope.editQuestion = function(){
      // TeacherService.editQuestion($scope.currentQuestion);
    };
  });
  app.controller('MainCtrl', function($scope, StudentService){
    $scope.registerUser = function() {
      StudentService.registerUser($scope.type);
    };
  });
})();
