(function(){
  'use strict';
  var app = angular.module('clarity.service', []);
  app.constant('Constant', {
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant) {
    this.currentQuestion = function(questionId) {
      return $http.get(Constant.url + 'teacher/question/'+ questionId);
    };
    this.addSet = function(newSetName){
      return $http.post(Constant.url + 'teacher/set', { setName: newSetName });
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
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.allQuestions = function() {
      return $http.get(Constant.url + 'teacher/allQuestion');
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
    this.registerUser = function(userType) {
      $http.post(Constant.url + 'register', {type: userType})
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.error(err);
      });
    };
    this.getUserInfo = function() {
      return $http.get(Constant.url + 'user');
    };
    this.allTeacher = function() {
      return $http.get(Constant.url + 'student/teachers');
    };
    this.addTeacher = function(teacher){
      return $http.patch(Constant.url + 'student/addteacher', teacher);
    };
    this.myTeacher = function() {
      return $http.get(Constant.url + 'student/myteachers');
    };
    this.postPoint = function() {
      return $http.patch(Constant.url + 'student/point/'+ $stateParams.roomId);
    };
    this.getPoint = function() {
      return $http.get(Constant.url + 'student/point/'+ $stateParams.roomId);
    };
  });
})();
