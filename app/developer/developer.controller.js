'use strict';

angular.module('gdgxHubApp')
  .controller('DeveloperCtrl', function ($scope, $http) {
    $http.get('/api/v1/rest').success(function (data) {
      $scope.restDiscovery = data;
    });
  });
