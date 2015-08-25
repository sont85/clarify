(function(){
  'use strict';
  var app = angular.module('clarity.service', []);
  app.constant('Constant', {
    // url: 'https://clarity.herokuapp.com/'
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant, $state) {
    var self = this;
    this.currentQuestion = function(questionId) {
      return $http.get(Constant.url + 'teacher/question/'+ questionId);
    };
    this.addSet = function($scope){
      $http.post(Constant.url + 'teacher/set', { setName: $scope.newSetName })
      .success(function(response) {
        self.allQuestions($scope);
        $scope.newSetName = '';
        $('#setModal').modal('hide');
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.addQuestion = function(newQuestion){
      return $http.post(Constant.url + 'teacher/question/'+ $stateParams.setId, newQuestion);
    };
    this.editQuestion = function(editedQuestion) {
      return $http.patch(Constant.url + 'teacher/question/' + $stateParams.questionId + '/' + $stateParams.questionId, editedQuestion);
    };
    this.deleteQuestion = function(question){
      $http.delete(Constant.url + 'teacher/question/'+ $stateParams.setId + '/'+ question._id)
      .success(function(response) {
        $state.reload();
      }).catch(function(err){
        console.log(err);
      });
    };
    this.allQuestions = function($scope) {
      $http.get(Constant.url + 'teacher/allQuestion')
      .success(function(response) {
        if (response._id) {
          $scope.teacherId = response._id;
        } else {
          $scope.allQuestion = response;
        }
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.deleteSet = function(set) {
      $http.delete(Constant.url + 'teacher/set/'+ set._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.getCurrentSet = function(setId) {
      return $http.get(Constant.url + 'teacher/set/'+setId);
    };
  });
  app.service('StudentService', function($http, Constant, $stateParams) {
    var self = this;
    this.registerUser = function(userType) {
      $http.post(Constant.url + 'register', {type: userType})
      .success(function(user) {
        swal({
          title: 'Successfully Registered',
          text: user.displayName + ' Added To System',
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
    this.getUserInfo = function() {
      return $http.get(Constant.url + 'user');
    };
    this.allTeacher = function($scope) {
      $http.get(Constant.url + 'student/teachers')
      .success(function(teachers) {
        $scope.teachers = teachers;
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.addTeacher = function($scope){
      $http.patch(Constant.url + 'student/addteacher', $scope.selectedTeacher)
      .success(function(response) {
        if (response === 'success') {
          swal(response, 'Successfully added Teacher', response);
          self.myTeacher($scope);
        } else {
          swal('Error', response, 'error');
        }
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.myTeacher = function($scope) {
      $http.get(Constant.url + 'student/myteachers')
      .success(function(teachers) {
        $scope.myTeachers = teachers;
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.postPoint = function($scope) {
      $http.patch(Constant.url + 'student/point/'+ $stateParams.roomId)
      .success(function(response) {
        self.getPoint($scope);
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.getPoint = function($scope) {
      $http.get(Constant.url + 'student/point/'+ $stateParams.roomId)
      .success(function(response) {
        $scope.pointsData = response;
        socket.emit('join room', response.studentName, $stateParams.roomId, response.studentId);
      }).catch(function(err) {
        console.log(err);
      });
    };
  });
})();
