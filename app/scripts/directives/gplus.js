'use strict';

angular.module('gdgxHubApp.directives.gplus', [])
  .directive('gplusPerson', function ($http, config) {
    return {
      restrict: 'EA',
      templateUrl: 'directives/gplus_person',
      scope: {
        gplusId: '='
      },
      link: function (scope) {
        scope.$watch('gplusId', function (oldVal, newVal) {
          if (newVal) {
            $http.get('https://www.googleapis.com/plus/v1/people/' + newVal +
                      '?fields=aboutMe%2CdisplayName%2Cimage&key=' + config.GOOGLE_API_KEY)
              .success(function (data) {
                data.image.url = data.image.url.replace('sz=50', 'sz=170');
                scope.person = data;
              });
          }
        });
      }
    };
  });
