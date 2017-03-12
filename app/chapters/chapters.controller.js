'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterCtrl', function ($scope, $http, $filter) {
    $http.get('/api/v1/chapters?perpage=999&fields=_id,name,geo,country,status').success(function (resp) {

      //noinspection JSUnusedGlobalSymbols
      $scope.map = {
        center: {
          latitude: 20,
          longitude: 0
        },
        zoom: 2,
        control: {},
        cluster: {
          maxZoom: 7
        },
        options: { scrollwheel: false },
        events: {
          tilesloaded: function (map) {
            $scope.$apply(function () {
              $scope.mapInstance = map;
              $scope.mapInstance.event.trigger($scope.map.control.getGMap(), 'resize');
            });
          }
        }
      };
      $scope.markers = [];

      processData(resp.items);

      function processData(data) {
        var chaptersByCountryName = {};
        var countries = [];

        for (var i = 0; i < data.length; i++) {
          var chapter = data[i];

          if (chapter.geo) {
            var marker = {
              id: chapter._id,
              name: chapter.name,
              status: chapter.status,
              show: false,
              coordinates: {
                latitude: chapter.geo.lat,
                longitude: chapter.geo.lng
              }
            };

            marker.onClick = function(marker) {
              marker.show = !marker.show;
            }.bind(marker, marker); // jshint ignore:line

            $scope.markers.push(marker);
          }

          if (chapter.country) {
            if (!chaptersByCountryName[chapter.country.name]) {
              countries.push(chapter.country.name);
              chaptersByCountryName[chapter.country.name] = { code: chapter.country._id, chapters: [] };
            }

            chaptersByCountryName[chapter.country.name].chapters.push(chapter);
          }
        }

        // Sort each country's chapters alphabetically
        angular.forEach(chaptersByCountryName, function (value, key) {
          chaptersByCountryName[key].chapters = sortChapters(value.chapters);
        });

        $scope.countries = getCountriesSortedByName(sortCountriesNames(countries), chaptersByCountryName);
      }

      function sortChapters(chapters) {
        return $filter('orderBy')(chapters, 'name');
      }

      function sortCountriesNames(countries) {
        return $filter('orderBy')(countries);
      }

      function getCountriesSortedByName(countries, chapters) {
        var sortedCollection = [];

        angular.forEach(countries, function (value, index) {
          sortedCollection[index] = chapters[value];
        });

        return sortedCollection;
      }
    });
  });
