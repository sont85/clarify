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
      return $http.post(Constant.url + 'register', {type: userType});
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
  app.service('ChartService', function() {
    this.chart = function(msg){
      Highcharts.createElement('link', {
        href: '//fonts.googleapis.com/css?family=Unica+One',
        rel: 'stylesheet',
        type: 'text/css'
      }, null, document.getElementsByTagName('head')[0]);

      Highcharts.theme = {
        colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
          "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
        ],
        chart: {
          backgroundColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 1,
              y2: 1
            },
            stops: [
              [0, '#2a2a2b'],
              [1, '#3e3e40']
            ]
          },
          style: {
            fontFamily: "'Unica One', sans-serif"
          },
          plotBorderColor: '#606063'
        },
        title: {
          style: {
            color: '#E0E0E3',
            textTransform: 'uppercase',
            fontSize: '20px'
          }
        },
        subtitle: {
          style: {
            color: '#E0E0E3',
            textTransform: 'uppercase'
          }
        },
        xAxis: {
          gridLineColor: '#707073',
          labels: {
            style: {
              color: '#E0E0E3'
            }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          title: {
            style: {
              color: '#A0A0A3'

            }
          }
        },
        yAxis: {
          gridLineColor: '#707073',
          labels: {
            style: {
              color: '#E0E0E3'
            }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          tickWidth: 1,
          title: {
            style: {
              color: '#A0A0A3'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
        },
        plotOptions: {
          series: {
            dataLabels: {
              color: '#B0B0B3'
            },
            marker: {
              lineColor: '#333'
            }
          },
          boxplot: {
            fillColor: '#505053'
          },
          candlestick: {
            lineColor: 'white'
          },
          errorbar: {
            color: 'white'
          }
        },
        legend: {
          itemStyle: {
            color: '#E0E0E3'
          },
          itemHoverStyle: {
            color: '#FFF'
          },
          itemHiddenStyle: {
            color: '#606063'
          }
        },
        credits: {
          style: {
            color: '#666'
          }
        },
        labels: {
          style: {
            color: '#707073'
          }
        },

        drilldown: {
          activeAxisLabelStyle: {
            color: '#F0F0F3'
          },
          activeDataLabelStyle: {
            color: '#F0F0F3'
          }
        },

        navigation: {
          buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
              fill: '#505053'
            }
          }
        },

        // scroll charts
        rangeSelector: {
          buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
              color: '#CCC'
            },
            states: {
              hover: {
                fill: '#707073',
                stroke: '#000000',
                style: {
                  color: 'white'
                }
              },
              select: {
                fill: '#000003',
                stroke: '#000000',
                style: {
                  color: 'white'
                }
              }
            }
          },
          inputBoxBorderColor: '#505053',
          inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
          },
          labelStyle: {
            color: 'silver'
          }
        },

        navigator: {
          handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
          },
          outlineColor: '#CCC',
          maskFill: 'rgba(255,255,255,0.1)',
          series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
          },
          xAxis: {
            gridLineColor: '#505053'
          }
        },

        scrollbar: {
          barBackgroundColor: '#808083',
          barBorderColor: '#808083',
          buttonArrowColor: '#CCC',
          buttonBackgroundColor: '#606063',
          buttonBorderColor: '#606063',
          rifleColor: '#FFF',
          trackBackgroundColor: '#404043',
          trackBorderColor: '#404043'
        },

        // special colors for some of the
        legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
        background2: '#505053',
        dataLabelsColor: '#B0B0B3',
        textColor: '#C0C0C0',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)'
      };

      // Apply the theme
      Highcharts.setOptions(Highcharts.theme);



      $(function() {
        $('#container').highcharts({
          chart: {
            type: 'column'
          },
          title: {
            text: 'Multiple Choice Selection'
          },
          subtitle: {
            text: ''
          },
          xAxis: {
            categories: [
              'A', 'B', 'C', 'D', 'Null'
            ],
            crosshair: true
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Rainfall (mm)'
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0
            }
          },
          series: [{
            data: [msg.A, msg.B, msg.C, msg.D, msg.null]
          }]
        });
        $('#container2').highcharts({
          chart: {
            type: 'pie',
            options3d: {
              enabled: true,
              alpha: 45,
              beta: 0
            }
          },
          title: {
            text: 'Classroom Results'
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              depth: 35,
              dataLabels: {
                enabled: true,
                format: '{point.name}'
              }
            }
          },
          series: [{
            type: 'pie',
            name: 'Browser share',
            data: [
              ['false', msg.false], {
                name: 'true',
                y: msg.true,
                sliced: true,
                selected: true
              },
              ['null', msg.null],
            ]
          }]
        });
      });
    }
  });
})();
