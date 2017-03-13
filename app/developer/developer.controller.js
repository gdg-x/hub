'use strict';

angular.module('gdgxHubApp').controller('DeveloperCtrl', DeveloperCtrl);

DeveloperCtrl.$inject = ['$scope', '$http'];

function DeveloperCtrl($scope, $http) {
  $http.get('/api/v1/rest').success(function(data) {
    $scope.restDiscovery = data;
  });
}
