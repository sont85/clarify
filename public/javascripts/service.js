(function(){
  'use strict';
  var app = angular.module('clarity.service', []);
  app.service('TeacherService', function($http, $stateParams) {
    var self = this;
    this.currentSet = null;
    this.addSet = function(newSetName){
      $http.post('http://localhost:3000/teacher/set', { setName: newSetName })
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.addQuestion = function(newQuestion){
      $http.post('http://localhost:3000/teacher/question/'+ self.currentSet._id, newQuestion)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.allQuestions = function() {
      return $http.get('http://localhost:3000/teacher/allQuestion');
    };
    this.deleteSet = function(set) {
      $http.delete('http://localhost:3000/teacher/set/'+ set._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.getCurrentSet = function(setId) {
      return $http.get('http://localhost:3000/teacher/set/'+setId);
    };
    this.deleteQuestion = function(question){
      $http.delete('http://localhost:3000/teacher/question/'+ self.currentSet._id + '/'+ question._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };

  });
  app.service('StudentService', function($http) {
    this.allTeacher = function() {
      return $http.get('http://localhost:3000/teachers');
    };
    this.addTeacher = function(teacher){
      $http.patch('http://localhost:3000/addteacher', teacher)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
      console.log(teacher);
    };
  });
})();
