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
        controller: 'MainCtrl'
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
  app.controller('StudentCtrl', function($scope, $state, TeacherService, StudentService) {
    StudentService.allTeacher()
    .success(function(teachers){
      $scope.teachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

    StudentService.myTeacher()
    .success(function(teachers){
      console.log(teachers);
      $scope.myTeachers = teachers;
    }).catch(function(err){
      console.log(err);
    });

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
    $scope.addTeacher = function(teacher){
      StudentService.addTeacher(teacher);
    };

    $scope.enterRoom = function(teacher){
      socket.emit('join', '55bebc7f2a5dfdda73ddd74f');
    };

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
      console.log(currentSet.createdBy);
      socket.emit('join', currentSet.createdBy);
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
      $http.post('http://localhost:3000/register', {type: $scope.type})
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
  app.constant('Constant', {
    url: 'http://localhost:3000/'
  });
  app.service('TeacherService', function($http, $stateParams, Constant) {
    var self = this;
    this.currentSet = null;
    this.addSet = function(newSetName){
      $http.post(Constant.url + 'teacher/set', { setName: newSetName })
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };
    this.addQuestion = function(newQuestion){
      $http.post(Constant.url + 'teacher/question/'+ self.currentSet._id, newQuestion)
      .success(function(response){
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
    this.deleteQuestion = function(question){
      $http.delete(Constant.url + 'teacher/question/'+ self.currentSet._id + '/'+ question._id)
      .success(function(response) {
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
    };

  });
  app.service('StudentService', function($http, Constant) {
    this.allTeacher = function() {
      return $http.get(Constant.url + 'teachers');
    };
    this.addTeacher = function(teacher){
      $http.patch(Constant.url + 'addteacher', teacher)
      .success(function(response){
        console.log(response);
      }).catch(function(err){
        console.log(err);
      });
      console.log(teacher);
    };
    this.myTeacher = function() {
      return $http.get(Constant.url + 'myteachers');
    };
  });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbmZpZy5qcyIsImNvbnRyb2xsZXIuanMiLCJzZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsWyd1aS5yb3V0ZXInLCAnY2xhcml0eS5zZXJ2aWNlJywgJ2NsYXJpdHkuY29udHJvbGxlcicsICdjbGFyaXR5LmNvbmZpZyddKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdjbGFyaXR5LmNvbmZpZycsIFtdKTtcbiAgYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9tYWluLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTWFpbkN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdzdHVkZW50Jywge1xuICAgICAgICB1cmw6ICcvc3R1ZGVudCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC9zdHVkZW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU3R1ZGVudEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCd0ZWFjaGVyJywge1xuICAgICAgICB1cmw6ICcvdGVhY2hlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi4vaHRtbC90ZWFjaGVyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVGVhY2hlckN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdxdWVzdGlvbkxpc3QnLCB7XG4gICAgICAgIHVybDogJy90ZWFjaGVyL3F1ZXN0aW9uTGlzdC86c2V0SWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy4uL2h0bWwvcXVlc3Rpb25MaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUXVlc3Rpb25DdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnY2xhcml0eS5jb250cm9sbGVyJywgW10pO1xuICB2YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL2xvY2FsaG9zdDozMDAwJyk7XG4gIGFwcC5jb250cm9sbGVyKCdTdHVkZW50Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBUZWFjaGVyU2VydmljZSwgU3R1ZGVudFNlcnZpY2UpIHtcbiAgICBTdHVkZW50U2VydmljZS5hbGxUZWFjaGVyKClcbiAgICAuc3VjY2VzcyhmdW5jdGlvbih0ZWFjaGVycyl7XG4gICAgICAkc2NvcGUudGVhY2hlcnMgPSB0ZWFjaGVycztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcblxuICAgIFN0dWRlbnRTZXJ2aWNlLm15VGVhY2hlcigpXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24odGVhY2hlcnMpe1xuICAgICAgY29uc29sZS5sb2codGVhY2hlcnMpO1xuICAgICAgJHNjb3BlLm15VGVhY2hlcnMgPSB0ZWFjaGVycztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbigndXNlcnMgY291bnQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY3VycmVudFRlc3RRdWVzdGlvbicsIGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhxdWVzdGlvbik7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudGltZSA9IHF1ZXN0aW9uLnRpbWU7XG4gICAgICAgICRzY29wZS50aW1lT3V0ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5jdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgJHNjb3BlLmFuc3dlciA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIHZhciB0aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAkc2NvcGUudGltZSAtLTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAkc2NvcGUudGltZU91dCA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnRpbWUgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCEkc2NvcGUuc3R1ZGVudEFuc3dlcikge1xuICAgICAgICAgIHNvY2tldC5lbWl0KCdhbnN3ZXJzJywgJ251bGwnKTtcbiAgICAgICAgfVxuICAgICAgfSwgcXVlc3Rpb24udGltZSAqIDEwMDApO1xuICAgIH0pO1xuXG4gICAgc29ja2V0Lm9uKCdyZXN1bHQnLCBmdW5jdGlvbihtc2cpe1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIGNvbnNvbGUubG9nKG1zZy50cnVlIC8gbXNnLnRvdGFsKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkVGVhY2hlciA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgU3R1ZGVudFNlcnZpY2UuYWRkVGVhY2hlcih0ZWFjaGVyKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmVudGVyUm9vbSA9IGZ1bmN0aW9uKHRlYWNoZXIpe1xuICAgICAgc29ja2V0LmVtaXQoJ2pvaW4nLCAnNTViZWJjN2YyYTVkZmRkYTczZGRkNzRmJyk7XG4gICAgfTtcblxuICAgICRzY29wZS5zdWJtaXRBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5zdHVkZW50QW5zd2VyKTtcbiAgICAgIHNvY2tldC5lbWl0KCdhbnN3ZXJzJywgJHNjb3BlLmN1cnJlbnRRdWVzdGlvbi5hbnN3ZXIgPT09ICRzY29wZS5zdHVkZW50QW5zd2VyKTtcbiAgICB9O1xuICB9KTtcblxuICBhcHAuY29udHJvbGxlcignVGVhY2hlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFRlYWNoZXJTZXJ2aWNlLCAkbG9jYXRpb24sICRzdGF0ZSl7XG5cbiAgICBzb2NrZXQub24oJ3Jlc3VsdCcsIGZ1bmN0aW9uKG1zZyl7XG4gICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgY29uc29sZS5sb2cobXNnLnRydWUgLyBtc2cudG90YWwpO1xuICAgIH0pO1xuXG4gICAgVGVhY2hlclNlcnZpY2UuYWxsUXVlc3Rpb25zKClcbiAgICAuc3VjY2VzcyhmdW5jdGlvbihhbGxRdWVzdGlvbil7XG4gICAgICBjb25zb2xlLmxvZyhhbGxRdWVzdGlvbik7XG4gICAgICAkc2NvcGUuYWxsUXVlc3Rpb24gPSBhbGxRdWVzdGlvbjtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbiAgICAkc2NvcGUuYWRkU2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmFkZFNldCgkc2NvcGUubmV3U2V0TmFtZSk7XG4gICAgICAkc2NvcGUubmV3U2V0TmFtZSA9Jyc7XG4gICAgfTtcbiAgICAkc2NvcGUuZWRpdExpc3QgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmN1cnJlbnRTZXQgPSBzZXQ7XG4gICAgICAkbG9jYXRpb24udXJsKCcvdGVhY2hlci9xdWVzdGlvbkxpc3QvJytzZXQuX2lkKTtcbiAgICB9O1xuICAgICRzY29wZS5kZWxldGVTZXQgPSBmdW5jdGlvbihzZXQpIHtcbiAgICAgIFRlYWNoZXJTZXJ2aWNlLmRlbGV0ZVNldChzZXQpO1xuICAgIH07XG4gIH0pO1xuICBhcHAuY29udHJvbGxlcignUXVlc3Rpb25DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBUZWFjaGVyU2VydmljZSwgJGxvY2F0aW9uLCAkc3RhdGUsICRzdGF0ZVBhcmFtcyl7XG4gICAgVGVhY2hlclNlcnZpY2UuZ2V0Q3VycmVudFNldCgkc3RhdGVQYXJhbXMuc2V0SWQpXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24oY3VycmVudFNldCl7XG4gICAgICBUZWFjaGVyU2VydmljZS5jdXJyZW50U2V0ID0gY3VycmVudFNldDtcbiAgICAgICRzY29wZS5jdXJyZW50U2V0ID0gY3VycmVudFNldDtcbiAgICAgIGNvbnNvbGUubG9nKGN1cnJlbnRTZXQuY3JlYXRlZEJ5KTtcbiAgICAgIHNvY2tldC5lbWl0KCdqb2luJywgY3VycmVudFNldC5jcmVhdGVkQnkpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH0pO1xuICAgICRzY29wZS5hZGRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgVGVhY2hlclNlcnZpY2UuYWRkUXVlc3Rpb24oJHNjb3BlLm5ld1F1ZXN0aW9uKTtcbiAgICAgICRzY29wZS5uZXdRdWVzdGlvbiA9ICcnO1xuICAgIH07XG4gICAgJHNjb3BlLnN0YXJ0VGVzdCA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICBzb2NrZXQuZW1pdCgnc3RhcnRUZXN0JywgcXVlc3Rpb24pO1xuICAgIH07XG4gICAgJHNjb3BlLmRlbGV0ZVF1ZXN0aW9uID0gZnVuY3Rpb24ocXVlc3Rpb24pe1xuICAgICAgY29uc29sZS5sb2cocXVlc3Rpb24pO1xuICAgICAgY29uc29sZS5sb2coVGVhY2hlclNlcnZpY2UuY3VycmVudFNldCk7XG4gICAgICBUZWFjaGVyU2VydmljZS5kZWxldGVRdWVzdGlvbihxdWVzdGlvbik7XG4gICAgfTtcbiAgfSk7XG4gIGFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApe1xuICAgICRzY29wZS5yZWdpc3RlclVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICRodHRwLnBvc3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9yZWdpc3RlcicsIHt0eXBlOiAkc2NvcGUudHlwZX0pXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnY2xhcml0eS5zZXJ2aWNlJywgW10pO1xuICBhcHAuY29uc3RhbnQoJ0NvbnN0YW50Jywge1xuICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC8nXG4gIH0pO1xuICBhcHAuc2VydmljZSgnVGVhY2hlclNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zLCBDb25zdGFudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmN1cnJlbnRTZXQgPSBudWxsO1xuICAgIHRoaXMuYWRkU2V0ID0gZnVuY3Rpb24obmV3U2V0TmFtZSl7XG4gICAgICAkaHR0cC5wb3N0KENvbnN0YW50LnVybCArICd0ZWFjaGVyL3NldCcsIHsgc2V0TmFtZTogbmV3U2V0TmFtZSB9KVxuICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICB0aGlzLmFkZFF1ZXN0aW9uID0gZnVuY3Rpb24obmV3UXVlc3Rpb24pe1xuICAgICAgJGh0dHAucG9zdChDb25zdGFudC51cmwgKyAndGVhY2hlci9xdWVzdGlvbi8nKyBzZWxmLmN1cnJlbnRTZXQuX2lkLCBuZXdRdWVzdGlvbilcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy5hbGxRdWVzdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvYWxsUXVlc3Rpb24nKTtcbiAgICB9O1xuICAgIHRoaXMuZGVsZXRlU2V0ID0gZnVuY3Rpb24oc2V0KSB7XG4gICAgICAkaHR0cC5kZWxldGUoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXIvc2V0LycrIHNldC5faWQpXG4gICAgICAuc3VjY2VzcyhmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICB0aGlzLmdldEN1cnJlbnRTZXQgPSBmdW5jdGlvbihzZXRJZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldChDb25zdGFudC51cmwgKyAndGVhY2hlci9zZXQvJytzZXRJZCk7XG4gICAgfTtcbiAgICB0aGlzLmRlbGV0ZVF1ZXN0aW9uID0gZnVuY3Rpb24ocXVlc3Rpb24pe1xuICAgICAgJGh0dHAuZGVsZXRlKENvbnN0YW50LnVybCArICd0ZWFjaGVyL3F1ZXN0aW9uLycrIHNlbGYuY3VycmVudFNldC5faWQgKyAnLycrIHF1ZXN0aW9uLl9pZClcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIH0pO1xuICBhcHAuc2VydmljZSgnU3R1ZGVudFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgQ29uc3RhbnQpIHtcbiAgICB0aGlzLmFsbFRlYWNoZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoQ29uc3RhbnQudXJsICsgJ3RlYWNoZXJzJyk7XG4gICAgfTtcbiAgICB0aGlzLmFkZFRlYWNoZXIgPSBmdW5jdGlvbih0ZWFjaGVyKXtcbiAgICAgICRodHRwLnBhdGNoKENvbnN0YW50LnVybCArICdhZGR0ZWFjaGVyJywgdGVhY2hlcilcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2codGVhY2hlcik7XG4gICAgfTtcbiAgICB0aGlzLm15VGVhY2hlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldChDb25zdGFudC51cmwgKyAnbXl0ZWFjaGVycycpO1xuICAgIH07XG4gIH0pO1xufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==