'use strict';

angular.module('gdgxHubApp.directives.gplus', ['d3'])
   .directive('gplusPerson', ['$http', function($http) {
      return {
            restrict: 'EA',
            templateUrl: 'directives/gplus_person',
            scope: {
              gplusId: "=",
            },
            link: function(scope, element, attrs) {
              scope.$watch('gplusId', function(oldVal, newVal) {
                if(newVal) {
                  $http.get("https://www.googleapis.com/plus/v1/people/"+newVal+"?fields=aboutMe%2CdisplayName%2Cimage&key=AIzaSyD7v04m_bTu-rcWtuaN3fTP9NBmjhB7lXg")
                    .success(function(data) {
                      data.image.url = data.image.url.replace("sz=50","sz=170");
                      scope.person = data;
                    });
                }
              });
            }
         };
   }]);