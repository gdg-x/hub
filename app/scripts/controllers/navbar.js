'use strict';

angular.module('gdgxHubApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },
    {
      'title': 'Chapters',
      'link': '/chapters'
    },
    {
      'title': 'Events',
      'link': '/events'
    },
    {
      'title': 'Statistics',
      'link': '/statistics'
    }];
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
