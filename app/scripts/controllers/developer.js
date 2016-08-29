'use strict';

angular.module('gdgxHubApp').controller('ApiCtrl', ApiCtrl);

ApiCtrl.$inject = ['$scope', '$http'];

function ApiCtrl($scope, $http) {
  $http.get('/api/v1/rest').success(function(data) {
    $scope.restDiscovery = data;
  });
}
