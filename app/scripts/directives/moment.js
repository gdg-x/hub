'use strict';

angular.module('gdgxHubApp.directives.moment', [])
  .directive('timeTimezone', function () {
    return {
      restrict: 'E',
      template: '{{formatDate}}',
      scope: {
        date: '=',
        timezone: '='
      },
      link: function (scope) {
        var update = function upd() {
          if (scope.timezone && scope.date) {
            scope.formatDate = moment(scope.date).tz(scope.timezone).format('LLLL');
          }
        };

        scope.$watch('date', function () {
          update();
        });

        scope.$watch('timezone', function () {
          update();
        });
      }
    };
  })
  .directive('timeAgo', ['$timeout', function ($timeout) {
    return {
      restrict: 'E',
      template: '{{formatDate}}',
      scope: {
        date: '='
      },
      link: function (scope) {
        var promise = null;

        var update = function () {
          if (scope.date) {
            scope.formatDate = moment(scope.date).fromNow();
            promise = $timeout(update, 60000, false);
          }
        };

        scope.$watch('date', function () {
          if (promise) {
            $timeout.cancel(promise);
          }
          update();
        });
      }
    };
  }])
  .directive('localTime', [function () {
    return {
      restrict: 'E',
      template: '{{formatDate}}',
      scope: {
        date: '='
      },
      link: function (scope) {
        var update = function upd() {
          scope.formatDate = moment(scope.date).format('LLLL');
        };

        scope.$watch('date', function () {
          update();
        });
      }
    };
  }])
  .directive('time', [function () {
    return {
      restrict: 'E',
      template: '{{formatDate}}',
      scope: {
        date: '='
      },
      link: function (scope) {
        var update = function upd() {
          scope.formatDate = moment(scope.date).utc().format('LLLL');
        };

        scope.$watch('date', function () {
          update();
        });
      }
    };
  }]);
