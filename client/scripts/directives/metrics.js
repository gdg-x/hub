'use strict';

angular.module('gdgxHubApp.directives.metrics', ['googlechart'])
  .directive('dailyMetric', ['$http', function ($http) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/metrics_daily',
      scope: {
        metric: '=',
        subject: '=',
        subjectName: '=',
        year: '=',
        month: '='
      },
      link: function (scope) {

        var updateMetric = function (oldVal, newVal) {
          if (newVal) {
            $http.get('/api/v1/metrics/daily/' + scope.subject + '/' + scope.metric + '/' + scope.year + '/' + scope.month)
              .success(function (data) {


                $http.get('/api/v1/chapters/' + scope.subject + '/events/year/' + scope.year + '/' + scope.month)
                  .success(function (eventData) {
                    log.info(eventData);

                    //var daysInMonth = moment(scope.year+'-'+scope.month, 'YYYY-M').daysInMonth();
                    var daysInMonth = moment().format('D') - 1;

                    var rows = [];
                    var count = 0;
                    for (var i = 1; i <= daysInMonth; i++) {
                      var day = moment(scope.year + '-' + scope.month + '-' + i, 'YYYY-M-D');

                      var evt;
                      var evt2;

                      for (var x = 0; x < eventData.items.length; x++) {
                        var ev = eventData.items[x];

                        if (moment(ev.start).startOf('day').isSame(day.startOf('day'))) {
                          evt = 'Event: ' + ev.title;
                          evt2 = String.fromCharCode('A'.charCodeAt() + count);
                          count++;
                        }
                      }

                      rows.push({
                        c: [
                          {
                            v: day.toDate()
                          },
                          {
                            v: data.values['' + i + '']
                          },
                          {
                            v: evt2
                          },
                          {
                            v: evt
                          }
                        ]
                      });
                    }

                    scope.chart = {
                      'type': 'LineChart',
                      'displayed': true,
                      'data': {
                        'cols': [
                          {
                            'id': 'date',
                            'label': 'Day',
                            'type': 'date',
                            'p': {}
                          },
                          {
                            'id': scope.metric,
                            'label': scope.subjectName,
                            'type': 'number',
                            'p': {}
                          },
                          {
                            'id': 'eventLbl',
                            'label': 'EventLbl',
                            'type': 'string',
                            'role': 'annotation',
                            'p': {}
                          },
                          {
                            'id': 'event',
                            'label': 'Event',
                            'type': 'string',
                            'role': 'annotationText',
                            'p': {}
                          }
                        ],
                        'rows': rows
                      },
                      'options': {
                        'fill': 20,
                        'displayAnnotations': true,
                        'displayExactValues': true
                      },
                      'formatters': {}
                    };

                  });
              });
          }
        };

        scope.$watch('metric', updateMetric);
      }
    };
  }]);
