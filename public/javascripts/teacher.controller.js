(function() {
  'use strict';
  var app = angular.module('clarity.controller.teacher', []);
  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state, StudentService) {
    TeacherService.allQuestions($scope);
    $scope.linkToChat = function() {
      if ($scope.teacherId) {
        $location.url('teacher/chatroom/' + $scope.teacherId);
      } else {
        $location.url('teacher/chatroom/' + $scope.allQuestion[0].createdBy);
      }
    };
    $scope.addSet = function() {
      TeacherService.addSet($scope);
    };
    $scope.linkToList = function(set) {
      $location.url('/teacher/set/' + set._id);
    };
    $scope.deleteSet = function(set) {
      swal({
        title: 'Delete question set?',
        text: 'All questions within this set will be deleted!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: false
      }, function() {
        swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
        TeacherService.deleteSet(set);
      });
    };
  });
  app.controller('SetCtrl', function($scope, TeacherService, IOService, ChartService, $location, $stateParams) {
    TeacherService.getCurrentSet($scope);
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
    IOService.on('result', function(msg) {
      ChartService.chart(msg);
    });

    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope);
    };
    $scope.startTest = function(question) {
      if ($scope.timer) {
        return;
      }
      (function clearAllIntervals() {
        for (var i = 1; i < 99999; i++)
          window.clearInterval(i);
      })();
      $('#container').empty();
      $('#container2').empty();
      var roomId = $scope.currentSet.createdBy;
      IOService.emit('startTest', question, roomId);
      $scope.timer = question.time;
      var timer = setInterval(function() {
        $scope.$apply(function() {
          $scope.timer--;
        });
      }, 1000);
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.timer = null;
          clearInterval(timer);
        });
      }, question.time * 1000);
    };
    $scope.linkToQuestion = function(question) {
      $location.url('teacher/' + $stateParams.setId + '/question/' + question._id);
    };
    $scope.linkToChat = function() {
      $location.url('teacher/chatroom/' + $scope.currentSet.createdBy);
    };
  });
  app.controller('TeacherChatCtrl', function($scope, TeacherService, StudentService, IOService, $location, $stateParams) {
    StudentService.getUserInfo()
      .success(function(user) {
        IOService.emit('join room', user.displayName, user._id);
        $scope.sendMessage = function() {
          IOService.emit('get chat message', $scope.message, user.displayName, user._id);
          $scope.message = '';
        };
      }).catch(function(err) {
        console.error(err);
      });
    $scope.$on('$destroy', function() {
      IOService.emit('leaving room');
    });
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
  });
  app.controller('QuestionCtrl', function(TeacherService, $scope, $location, $stateParams) {
    TeacherService.currentQuestion($scope);
    $scope.deleteQuestion = function() {
      TeacherService.deleteQuestion($scope.currentQuestion);
      $location.url('teacher/set/' + $stateParams.setId);
    };
    $scope.editQuestion = function() {
      TeacherService.editQuestion($scope);
    };
  });
  app.controller('MainCtrl', function($scope, StudentService, Constant) {
    StudentService.getUserInfo()
      .success(function(user) {
        $scope.user = user;
      }).catch(function(err) {
        console.error(err);
      });
    $scope.registerUser = function() {
      StudentService.registerUser($scope.type);
    };
  });
})();
