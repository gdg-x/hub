'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterCountryCtrl', function ($scope, $http, $routeParams) {
    $scope.country = $routeParams.country;
    $scope.map = {
      options: {
        draggable: true
      },
      zoom: 4,
      center: undefined,
      control: undefined,
      cluster: undefined
    };
    $scope.chapterMapOptions = {
      disableDefaultUI: true,
      scrollwheel: false,
      draggable: false
    };

    $http.get('/api/v1/chapters/country/' + $routeParams.country + '?sort=name')
      .success(function (resp) {

        var data = resp.items;
        for (var i = 0; i < data.length; i++) {
          if (data[i].geo) {
            data[i].geo.latitude = data[i].geo.lat;
            data[i].geo.longitude = data[i].geo.lng;
            // Center the map on the first chapter with geo coordinates
            if (!$scope.map.center) {
              $scope.map.center = {
                latitude: data[i].geo.latitude,
                longitude: data[i].geo.longitude
              };
            }
            data[i].show = false;
            data[i].onClick = function(marker) {
              marker.show = !marker.show;
            }.bind(data[i], data[i]); // jshint ignore:line

            delete data[i].geo.lng;
            delete data[i].geo.lat;
          }
        }
        $scope.chapters = data;
      });
  });
