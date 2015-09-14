'use strict';

angular.module('gdgxHubApp')
  .controller('AdminTagCtrl', function ($scope, $http, $routeParams) {
    var tagId = $routeParams.tagId;
    $scope.tag = {};
    $http.get('/api/v1/tags/' + tagId).then(
      function (response) {
        $scope.tag = angular.copy(response.data);
      }, function(response) {
        console.log('invalid tag ' + tagId);
      });

    $scope.update = function(tag) {
      $http.put('/api/v1/tags/' + tagId, tag)
      .then(
        function (resp) {
          console.log('tag saved');
        }, function(response) {
          console.log('invalid tag ' + tagId);
        });
    };
  });
