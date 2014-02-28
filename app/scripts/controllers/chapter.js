'use strict';

angular.module('gdgxHubApp')
  .controller('ChapterCtrl', function ($scope, $http) {
	$http.get("/api/v1/chapters?perpage=999&fields=_id,name,geo,country,status&sort=country").success(function(resp, status, headers, config) {

    	var chapters = {};
      var data = resp.items;
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
    $http.get("/api/v1/chapters/country/"+$routeParams['country']+"?sort=name").success(function(resp) {
      
      var data = resp.items;
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
  .controller('ChapterDetailCtrl', function ($scope, $http, $routeParams, $location) {
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

    $scope.chapterCalendar = {};

    $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
      $scope.$apply(function() {
        $location.path( "/events/"+event.id );
      });
    };

    $scope.chapterCalendarConfig = {
      timeFormat: {
        '': "h(:mm)t",
        "month": "h(:mm)t",
        agenda: "h:mm{ - h:mm}"
      },
      eventClick: $scope.alertOnEventClick
    };

    $scope.changeCalendarView = function(view,calendar) {
      calendar.fullCalendar('changeView',view);
    };

    $scope.events = function (start, end, callback) {
      $http.get("/api/v1/chapters/"+$routeParams['chapterId']+"/events/"+start.getTime()+"/"+end.getTime()).success(function(resp) {
        var events = [];
        var data = resp.items;

        for(var i = 0; i < data.length; i++) {
          events.push({
            title: data[i].title,
            start: data[i].start,
            id: data[i]._id,
            end: data[i].end,
            allDay: data[i].allDay
          });
        }

        callback(events);
      });
    };

    $scope.eventSource = [ $scope.events ];

  });