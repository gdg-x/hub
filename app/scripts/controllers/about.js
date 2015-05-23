'use strict';

angular.module('gdgxHubApp')
	.controller('AboutCtrl', function ($scope, $http) {
		$http.get('https://api.github.com/repos/gdg-x/hub/contributors').success(function(data) {
			$scope.contributors = data;
		});
	});
