(function(){
  'use strict';
  var app = angular.module('clarity.service.teacher', []);
  app.constant('Constant', {
    // url: 'https://clarity.herokuapp.com/'
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant, $state, IOService) {
    var self = this;
    this.currentQuestion = function($scope) {
      $http.get(Constant.url + 'teacher/question/'+ $stateParams.questionId)
      .success(function(response) {
        $scope.currentQuestion = response;
      }).catch(function(err) {
        console.log(err);
      });
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
    this.addQuestion = function($scope){
      $http.post(Constant.url + 'teacher/question/'+ $stateParams.setId, $scope.newQuestion)
      .success(function(response) {
        self.getCurrentSet($scope);
        $scope.newQuestion = '';
        $('#questionModal').modal('hide');
      }).catch(function(err) {
        console.log(err);
      });
    };
    this.editQuestion = function($scope) {
      $http.patch(Constant.url + 'teacher/question/' + $stateParams.questionId + '/' + $stateParams.questionId, $scope.editedQuestion)
      .success(function(response) {
        self.currentQuestion($scope);
        $('#editQuestion').modal('hide');
        $scope.editedQuestion = '';
      }).catch(function(err) {
        console.log(err);
      });
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
        $state.reload();
      }).catch(function(err){
        console.log(err);
      });
    };
    this.getCurrentSet = function($scope) {
      $http.get(Constant.url + 'teacher/set/'+ $stateParams.setId)
      .success(function(currentSet) {
        $scope.currentSet = currentSet;
        IOService.emit('join room', currentSet.teacherName, currentSet.createdBy);
      }).catch(function(err) {
        console.log(err);
      });
    };
  });
})();
