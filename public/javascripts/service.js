(function(){
  'use strict';
  var app = angular.module('clarity.service', []);
  app.constant('Constant', {
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant) {
    var self = this;
    this.currentSet = null;
    this.currentQuestion = function(questionId) {
      return $http.get(Constant.url + 'teacher/question/'+ questionId);
    };
    this.addSet = function(newSetName){
      return $http.post(Constant.url + 'teacher/set', { setName: newSetName });
    };
    this.addQuestion = function(newQuestion){
      return $http.post(Constant.url + 'teacher/question/'+ self.currentSet._id, newQuestion);
    };
    this.editQuestion = function(editedQuestion) {
      console.log(self.currentSet._id);
      console.log($stateParams.questionId);
      return $http.patch(Constant.url + 'teacher/question/' + self.currentSet._id + '/' + $stateParams.questionId, editedQuestion);
    };
    this.deleteQuestion = function(question){
      $http.delete(Constant.url + 'teacher/question/'+ self.currentSet._id + '/'+ question._id)
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
    this.currentTeacher = null;
    this.registerUser = function(userType) {
      $http.post(Constant.url + 'register', {type: userType})
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.error(err);
      });
    };
    this.allTeacher = function() {
      return $http.get(Constant.url + 'student/teachers');
    };
    this.addTeacher = function(teacher){
      $http.patch(Constant.url + 'student/addteacher', teacher)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
      console.log(teacher);
    };
    this.myTeacher = function() {
      return $http.get(Constant.url + 'student/myteachers');
    };
    this.postPoint = function() {
      $http.patch(Constant.url + 'student/point/'+ $stateParams.roomId)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.getPoint = function() {
      return $http.get(Constant.url + 'student/point/'+ $stateParams.roomId);
    };
  });
})();
