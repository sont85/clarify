(function() {
  'use strict';
  var app = angular.module('clarity.controller.teacher', []);
  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state) {
    function bindSet() {
      TeacherService.allQuestions()
        .success(function(allQuestion) {
          console.log(allQuestion)
          $scope.allQuestion = allQuestion;
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindSet();

    $scope.linkToChat = function(){
      console.log($scope.allQuestion[0].createdBy)
      $location.url('teacher/chatroom/'+$scope.allQuestion[0].createdBy);
    };
    $scope.addSet = function() {
      TeacherService.addSet($scope.newSetName)
        .success(function(response) {
          bindSet();
          $scope.newSetName = '';
          $('#setModal').modal('hide');
        }).catch(function(err) {
          console.log(err);
        });
    };
    $scope.linkToList = function(set) {
      $location.url('/teacher/questionList/' + set._id);
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
        $state.reload();
      });
    };
  });
  app.controller('QuestionListCtrl', function($scope, TeacherService, ChartService, $location, $stateParams, $state) {
    function bindCurrentSet() {
      TeacherService.getCurrentSet($stateParams.setId)
      .success(function(currentSet) {
        $scope.currentSet = currentSet;
        socket.emit('join room', currentSet.teacherName, currentSet.createdBy);
      }).catch(function(err) {
        console.log(err);
      });
    }
    bindCurrentSet();
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
    socket.on('result', function(msg) {
      console.log(msg)
      ChartService.chart(msg);
    });

    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion)
        .success(function(response) {
          bindCurrentSet();
          $scope.newQuestion = '';
          $('#questionModal').modal('hide');
        }).catch(function(err) {
          console.log(err);
        });
    };
    $scope.startTest = function(question) {
      (function clearAllIntervals() {
        for (var i = 1; i < 99999; i++)
          window.clearInterval(i);
      })();
      $('#container').empty();
      $('#container2').empty();
      var roomId = $scope.currentSet.createdBy;
      socket.emit('startTest', question, roomId);
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
    $scope.linkToChat = function(){
      $location.url('teacher/chatroom/'+ $scope.currentSet.createdBy);
    };
  });
  app.controller('TeacherChatCtrl', function($scope, TeacherService, StudentService, $location, $stateParams, $state) {
    function bindSet() {
      TeacherService.allQuestions()
        .success(function(allQuestion) {
          socket.emit('join room', allQuestion[0].teacherName, $stateParams.roomId);
          $scope.sendMessage = function() {
            socket.emit('chat message', $scope.message, allQuestion[0].teacherName, $stateParams.roomId);
            $scope.message = '';
          };
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindSet();
    $scope.$on('$destroy', function() {
      socket.emit('leaving room');
    });

    $scope.linkToQuiz = function() {
    };

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
  app.controller('QuestionCtrl', function(TeacherService, $scope, $location, $stateParams) {
    function bindQuestion() {
      TeacherService.currentQuestion($stateParams.questionId)
        .success(function(response) {
          $scope.currentQuestion = response;
        }).catch(function(err) {
          console.log(err);
        });
    }
    bindQuestion();

    $scope.deleteQuestion = function() {
      TeacherService.deleteQuestion($scope.currentQuestion);
      $location.url('teacher/questionList/' + $stateParams.setId);
    };
    $scope.editQuestion = function() {
      TeacherService.editQuestion($scope.editedQuestion)
        .success(function(response) {
          bindQuestion();
          $('#editQuestion').modal('hide');
          $scope.editedQuestion = '';
        }).catch(function(err) {
          console.log(err);
        });
    };
  });
  app.controller('MainCtrl', function($scope, StudentService, Constant) {
    StudentService.getUserInfo()
      .success(function(response) {
        $scope.user = response;
        console.log(response);
      }).catch(function(err) {
        console.error(err);
      });
    $scope.registerUser = function() {
      StudentService.registerUser($scope.type)
        .success(function(response) {
          swal({
            title: 'Successfully Registered',
            text: response.displayName + ' Added To System',
            type: 'success',
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Confirm'
          }, function() {
            location.href = Constant.url + 'auth/google';
          });
        }).catch(function(err) {
          console.error(err);
        });
    };
  });
})();
