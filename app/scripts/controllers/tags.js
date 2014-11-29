'use strict';

angular.module('gdgxHubApp')
  .controller('TagManagementCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/tags').success(function(tagData) {
      $scope.tags = tagData.items;
      $scope.tag = tagData[0];
    });
  });