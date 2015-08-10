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
        if (response === 'success'){
          swal(response, 'Successfully added Teacher', response);
        } else {
          swal('Error', response , 'error');
        }
        bindMyTeacher();
      }).catch(function(err) {
        console.log(err);
      });
    };
    $scope.enterRoom = function(teacher) {
      $location.url('/student/room/' + teacher._id);
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

    $scope.$on('$destroy', function(){
      socket.emit('leaving room');
    });

    socket.on('leave room', function(users) {
      $scope.$apply(function() {
        $scope.users = users;
      });
    });

    $scope.sendMessage = function() {
      socket.emit('chat message', $scope.message, $scope.pointsData.studentName, $stateParams.roomId);
      $scope.message = '';
    };
    socket.on('message', function(message) {
      $scope.$apply(function(){
        $scope.messages = message;
        console.log($scope.messages);
      });
    });

    socket.on('stored messages and users', function(message, users) {
      $scope.$apply(function() {
        $scope.users = users;
        $scope.messages = message;
        console.log($scope.messages);
      });
    });

    $scope.submitAnswer = function() {
      var result = $scope.currentQuestion.answer === $scope.studentAnswer;
      $scope.result = result;
      socket.emit('answers', result, $scope.studentAnswer, $stateParams.roomId);
      $scope.timeOut = true;
      console.log(result);
      if (result) {
        StudentService.postPoint()
          .success(function(response) {
            bindPoint();
          }).catch(function(err) {
            console.log(err);
          });
      }
    };

    socket.on('currentTestQuestion', function(question) {
      $('#container').empty();
      $('#container2').empty();
      $scope.$apply(function() {
        $scope.time = question.time;
        $scope.timeOut = false;
        $scope.currentQuestion = question;
        $scope.answer = null;
      });
      var timer = setInterval(function() {
        $scope.$apply(function() {
          $scope.time--;
        });
      }, 1000);

      setTimeout(function() {
        clearInterval(timer);
        $scope.$apply(function() {
          $scope.timeOut = true;
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
      console.log('correct ratio', msg.true / msg.total);
      ChartService.chart(msg);
    });
  });
})();
