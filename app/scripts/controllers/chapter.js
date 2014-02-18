'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterCtrl', function ($scope, $http) {
	$http.get("/api/v1/chapters?limit=999&fields=_id,name,geo,country,status&sort=country").success(function(data, status, headers, config) {

    	var chapters = {};
    	for(var i = 0; i < data.length; i++) {
    		var chapter = data[i];

    		if(chapter.geo) {
	    		chapter.geo.latitude = chapter.geo.lat;
	    		chapter.geo.longitude = chapter.geo.lng;
	    		delete chapter.geo.lng;
	    		delete chapter.geo.lat;
    		}

    		if(!chapters[chapter.country])
    			chapters[chapter.country] = [];

    		chapters[chapter.country].push(chapter);
    	}
    	$scope.chapters_flat = data;
    	$scope.chapters = chapters;
  	});
  })
  .controller('ChapterCountryCtrl', function ($scope, $http, $routeParams) {
    $scope.country = $routeParams['country'];
    $http.get("/api/v1/chapters/country/"+$routeParams['country']+"?sort=name").success(function(data) {
      
      for(var i = 0; i < data.length; i++) {
        if(data[i].geo) {
          data[i].geo.latitude = data[i].geo.lat;
          data[i].geo.longitude = data[i].geo.lng;
          delete data[i].geo.lng;
          delete data[i].geo.lat;
        }
      }

      $scope.chapters = data;
    });
  })
  .controller('ChapterDetailCtrl', function ($scope, $http, $routeParams) {
    $http.get("/api/v1/chapters/"+$routeParams['chapterId']).success(function(data) {
      
      if(data.geo) {
        data.geo.latitude = data.geo.lat;
        data.geo.longitude = data.geo.lng;
        delete data.geo.lng;
        delete data.geo.lat;
      }

    	$scope.chapter = data;
    });
    $http.get("https://www.googleapis.com/plus/v1/people/"+$routeParams['chapterId']+"?fields=aboutMe&key=AIzaSyD7v04m_bTu-rcWtuaN3fTP9NBmjhB7lXg").success(function(data) {
      $scope.about = data.aboutMe;
    });

  });