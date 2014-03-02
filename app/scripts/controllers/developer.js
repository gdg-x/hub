'use strict';

angular.module('gdgxHubApp')
  .controller('ApiCtrl', function ($scope, $http) {
  	$http.get('/api/v1/rest').success(function(data) {
  		$scope.restDiscovery = data;
  	});
  });