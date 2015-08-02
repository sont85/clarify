(function() {
  'use strict';
  var app = angular.module('app',['ui.router', 'clarity.service', 'clarity.controller', 'clarity.config']);
})();

(function() {
  'use strict';
  var app = angular.module('clarity.config', []);
  app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '../html/main.html',
        controller: 'StudentCtrl'
      })
      .state('student', {
        url: '/student',
        templateUrl: '../html/student.html',
        controller: 'StudentCtrl'
      })
      .state('teacher', {
        url: '/teacher',
        templateUrl: '../html/teacher.html',
        controller: 'TeacherCtrl'
      })
      .state('questionList', {
        url: '/teacher/questionList/:setId',
        templateUrl: '../html/questionList.html',
        controller: 'QuestionCtrl'
      });
  });
})();

(function(){
  'use strict';
  var app = angular.module('clarity.controller', []);
  var socket = io.connect('http://localhost:3000');
  app.controller('StudentCtrl', function($scope, $state, TeacherService) {
    socket.on('users count', function(msg){
      console.log(msg);
    });

    socket.on('currentTestQuestion', function(question) {
      console.log(question);
      $scope.$apply(function() {
        $scope.time = question.time;
        $scope.timeOut = false;
        $scope.currentQuestion = question;
        $scope.answer = null;
      });
      var timer = setInterval(function(){
        $scope.$apply(function(){
          $scope.time --;
        });
      }, 1000);

      setTimeout(function(){
        clearInterval(timer);
        $scope.$apply(function() {
          $scope.timeOut = true;
          $scope.time = null;
        });
        if (!$scope.studentAnswer) {
          socket.emit('answers', 'null');
        }
      }, question.time * 1000);
    });

    socket.on('result', function(msg){
      console.log(msg);
      console.log(msg.true / msg.total);
    });

    $scope.submitAnswer = function() {
      console.log($scope.studentAnswer);
      socket.emit('answers', $scope.currentQuestion.answer === $scope.studentAnswer);
    };
  });

  app.controller('TeacherCtrl', function($scope, TeacherService, $location, $state){
    socket.on('result', function(msg){
      console.log(msg);
      console.log(msg.true / msg.total);
    });

    TeacherService.allQuestions()
    .success(function(allQuestion){
      console.log(allQuestion);
      $scope.allQuestion = allQuestion;
    }).catch(function(err){
      console.log(err);
    });
    $scope.addSet = function(){
      TeacherService.addSet($scope.newSetName);
      $scope.newSetName ='';
    };
    $scope.editList = function(set) {
      TeacherService.currentSet = set;
      $location.url('/teacher/questionList/'+set._id);
    };
    $scope.deleteSet = function(set) {
      TeacherService.deleteSet(set);
    };
  });
  app.controller('QuestionCtrl', function($scope, TeacherService, $location, $state, $stateParams){
    TeacherService.getCurrentSet($stateParams.setId)
    .success(function(currentSet){
      TeacherService.currentSet = currentSet;
      $scope.currentSet = currentSet;
    }).catch(function(err){
      console.log(err);
    });
    $scope.addQuestion = function() {
      TeacherService.addQuestion($scope.newQuestion);
      $scope.newQuestion = '';
    };
    $scope.startTest = function(question) {
      socket.emit('startTest', question);
    };
    $scope.deleteQuestion = function(question){
      console.log(question);
      console.log(TeacherService.currentSet);
      TeacherService.deleteQuestion(question);
    };
  });
  app.controller('MainCtrl', function($scope, $http){
    $scope.registerUser = function() {
      $http.post('http://localhost:3000/register', {userType: $scope.userType})
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.error(err);
      });
    };
  });
})();

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
})();
