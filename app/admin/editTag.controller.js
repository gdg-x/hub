'use strict';

angular.module('gdgxHubApp')
  .controller('EditTagCtrl', function ($scope, $log, $http, $routeParams) {
    var tagId = $routeParams.tagId;
    $scope.tag = {};
    $http.get('/api/v1/tags/' + tagId).then(
      function (response) {
        $scope.tag = angular.copy(response.data);
      }, function() {
        $log.debug('invalid tag ' + tagId);
      });

    $scope.update = function(tag) {
      $http.put('/api/v1/tags/' + tagId, tag)
      .then(
        function () {
          $log.debug('tag saved');
        }, function() {
          $log.debug('invalid tag ' + tagId);
        });
    };
  });
