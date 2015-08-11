(function() {
  'use strict';
  var app = angular.module('clarity.controller.student', []);
  app.controller('StudentCtrl', function($scope, TeacherService, StudentService, $location) {
    StudentService.allTeacher()
      .success(function(teachers) {
        $scope.teachers = teachers;
      }).catch(function(err) {
        console.log(err);
      });

    function bindMyTeacher() {
      StudentService.myTeacher()
        .success(function(teachers) {
          console.log(teachers);
          $scope.myTeachers = teachers;
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindMyTeacher();

    $scope.addTeacher = function() {
      StudentService.addTeacher($scope.selectedTeacher)
        .success(function(response) {
          if (response === 'success') {
            swal(response, 'Successfully added Teacher', response);
          } else {
            swal('Error', response, 'error');
          }
          bindMyTeacher();
        }).catch(function(err) {
          console.log(err);
        });
    };
    $scope.enterRoom = function(teacher) {
      $location.url('/student/room/' + teacher._id);
    };
    $scope.linkToChat = function(teacher) {
      console.log(teacher)
      $location.url('/student/chatroom/' + teacher._id);
    };
  });
  app.controller('RoomCtrl', function($scope, TeacherService, StudentService, ChartService, $location, $stateParams) {
    function bindPoint() {
      StudentService.getPoint()
        .success(function(response) {
          $scope.pointsData = response;
          socket.emit('join room', response.studentName, $stateParams.roomId, response.studentId);
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindPoint();

    $scope.$on('$destroy', function() {
      socket.emit('leaving room');
    });

    socket.on('leave room', function(users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });

    socket.on('stored messages and users', function(message, users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });

    $scope.submitAnswer = function() {
      var result = $scope.currentQuestion.answer === $scope.studentAnswer;
      $scope.result = result;
      socket.emit('answers', result, $scope.studentAnswer, $stateParams.roomId);
      console.log(result);
      if (result) {
        swal({
          title: 'Correct',
          text: '+1 Point',
          timer: 2000,
          type: 'success',
          showConfirmButton: false
        });
        StudentService.postPoint()
        .success(function(response) {
          bindPoint();
        }).catch(function(err) {
          console.log(err);
        });
      } else {
        swal({
          title: 'Wrong',
          timer: 2000,
          type: 'error',
          showConfirmButton: false
        });
      }
    };

    socket.on('start question', function(question) {
      (function clearAllIntervals(){
          for (var i = 0; i < 99999; i++) {
            window.clearInterval(i);
          }
      })();
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
        if (!$scope.studentAnswer) {
          console.log($stateParams.roomId);
          socket.emit('answers', 'null', 'null', $stateParams.roomId);
        }
      }, question.time * 1000);
    });

    socket.on('result', function(msg) {
      console.log(msg);
      ChartService.chart(msg);
    });
  });
  app.controller('StudentChatCtrl', function($scope, StudentService, $location, $stateParams, $state) {
    function joinChatroom() {
      StudentService.getUserInfo()
        .success(function(user) {
          socket.emit('join room', user.displayName, $stateParams.roomId);
          $scope.sendMessage = function() {
            socket.emit('chat message', $scope.message, user.displayName, $stateParams.roomId);
            $scope.message = '';
          };
        }).catch(function(err) {
          console.log(err);
        });
    }
    joinChatroom();
    $scope.$on('$destroy', function() {
      socket.emit('leaving room');
    });

    socket.on('message', function(message) {
      $scope.$apply(function() {
        $scope.messages = message;
      });
    });

    socket.on('leave room', function(users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });
    socket.on('stored messages and users', function(message, users) {
      $scope.$apply(function() {
        $scope.users = users;
        $scope.messages = message;
      });
    });
  });
})();
