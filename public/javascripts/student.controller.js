(function() {
  'use strict';
  var app = angular.module('clarity.controller.student', []);
  app.controller('StudentCtrl', function($scope, StudentService, $location, IOService) {
    StudentService.allTeacher($scope);
    StudentService.myTeacher($scope);

    $scope.addTeacher = function() {
      StudentService.addTeacher($scope);
    };
    $scope.enterRoom = function(teacher) {
      $location.url('/student/room/' + teacher._id);
    };
    $scope.linkToChat = function(teacher) {
      $location.url('/student/chatroom/' + teacher._id);
    };
  });
  app.controller('RoomCtrl', function($scope, StudentService, ChartService, IOService, $location, $stateParams) {
    StudentService.getPoint($scope);
    $scope.$on('$destroy', function() {
      IOService.emit('leaving room');
    });
    IOService.on('leave room', function(users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });
    IOService.on('all chat messages/users', function(message, users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });
    $scope.linkToChat = function() {
      $location.url('student/chatroom/' + $stateParams.roomId);
    };
    $scope.submitAnswer = function() {
      $scope.answerSent = true;
      $scope.result = $scope.currentQuestion.answer === $scope.studentAnswer;
      IOService.emit('answers', $scope.result, $scope.studentAnswer, $stateParams.roomId);
      if ($scope.result) {
        swal({
          title: 'Correct',
          text: '+1 Point',
          timer: 2000,
          type: 'success',
          showConfirmButton: false
        });
        StudentService.postPoint($scope);
      } else {
        swal({
          title: 'Wrong',
          timer: 2000,
          type: 'error',
          showConfirmButton: false
        });
      }
    };
    IOService.on('start question', function(question) {
      (function clearAllIntervals() {
        for (var i = 0; i < 99999; i++) {
          window.clearInterval(i);
        }
      })();
      IOService.emit('number of test taker', $scope.pointsData.studentName)
      $('#container').empty();
      $('#container2').empty();
      $scope.$apply(function() {
        $scope.time = question.time;
        $scope.currentQuestion = question;
        $scope.studentAnswer = null;
      });
      var timer = setInterval(function() {
        $scope.$apply(function() {
          $scope.time--;
        });
      }, 1000);

      setTimeout(function() {
        clearInterval(timer);
        $scope.$apply(function() {
          $scope.time = null;
        });
        if (!$scope.answerSent) {
          IOService.emit('answers', 'null', 'null', $stateParams.roomId);
          $scope.answerSent = null;
        }
      }, question.time * 1000);
    });
    IOService.on('result', function(msg) {
      ChartService.chart(msg);
    });
  });
  app.controller('StudentChatCtrl', function($scope, StudentService, IOService, $location, $stateParams) {
    StudentService.getUserInfo($scope)
      .success(function(user) {
        IOService.emit('join room', user.displayName, $stateParams.roomId, user._id);
        $scope.sendMessage = function() {
          IOService.emit('get chat message', $scope.message, user.displayName, $stateParams.roomId);
          $scope.message = '';
        };
      }).catch(function(err) {
        console.log(err);
      });
    $scope.$on('$destroy', function() {
      IOService.emit('leaving room');
    });
    $scope.student = true;

    IOService.on('message', function(message) {
      $scope.$apply(function() {
        $scope.messages = message;
      });
    });

    IOService.on('leave room', function(users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });
    IOService.on('all chat messages/users', function(message, users) {
      $scope.$apply(function() {
        $scope.users = users;
        $scope.messages = message;
      });
    });
    $scope.linkToQuiz = function() {
      $location.url('student/room/' + $stateParams.roomId);
    };
  });
})();
