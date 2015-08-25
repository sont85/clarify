(function(){
  'use strict';
  var app = angular.module('clarity.service.student', []);
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
