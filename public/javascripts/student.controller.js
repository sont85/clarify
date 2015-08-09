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
    socket.on('users count', function(msg) {
      console.log(msg);
    });

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
          socket.emit('join', response.studentName, $stateParams.roomId);
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindPoint();

    $scope.sendMessage = function() {
      socket.emit('chat message', $scope.message, $scope.pointsData.studentName, $stateParams.roomId);
      $scope.message = '';
    };
    $scope.messages = [];
    socket.on('message', function(text, name) {
      $scope.$apply(function(){
        var message = {
          text: text,
          name: name
        };
        $scope.messages.unshift(message);
      });
    });

    socket.on('user in room', function(names, numberOfUser) {
      $scope.$apply(function() {
        console.log(names);
        console.log('number of user', numberOfUser);
        $scope.names = names;
        $scope.userCount = numberOfUser;
      });
    });

    $scope.submitAnswer = function() {
      var result = $scope.currentQuestion.answer === $scope.studentAnswer;
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
      console.log("correct ratio", msg.true / msg.total);
      ChartService.chart(msg);
    });
  });
})();
