'use strict';

angular.module('gdgxHubApp')
  .constant('GOOGLE_API_KEY', 'AIzaSyD7v04m_bTu-rcWtuaN3fTP9NBmjhB7lXg')
  .service('config', function (GOOGLE_API_KEY) {
    return {
      GOOGLE_API_KEY: GOOGLE_API_KEY
    };
  })
  .config(function ($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider, GOOGLE_API_KEY) {
    uiGmapGoogleMapApiProvider.configure({
      key: GOOGLE_API_KEY,
      v: '3.24',
      libraries: 'weather,geometry,visualization'
    });

    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainController'
      })
      .when('/dashboard', {
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/about', {
        templateUrl: 'about/about.html',
        controller: 'AboutCtrl'
      })
      .when('/chapters', {
        templateUrl: 'chapters/chapters.html',
        controller: 'ChapterCtrl'
      })
      .when('/chapters/country/:country', {
        templateUrl: 'chapters/chapterCountry.html',
        controller: 'ChapterCountryCtrl'
      })
      .when('/chapters/:chapterId', {
        templateUrl: 'chapters/chapterDetail.html',
        controller: 'ChapterDetailCtrl'
      })
      .when('/chapters/:chapterId/metrics', {
        templateUrl: 'chapters/chapterMetrics.html',
        controller: 'ChapterMetricsCtrl'
      })
      .when('/events', {
        templateUrl: 'events/events.html',
        controller: 'EventsCtrl'
      })
      .when('/events/devfest', {
        templateUrl: 'partials/devfest.html'
      })
      .when('/events/tags', {
        templateUrl: 'events/events.html',
        controller: 'EventsCtrl'
      })
      .when('/events/tags/:tag', {
        templateUrl: 'events/events.html',
        controller: 'EventsCtrl'
      })
      .when('/events/:eventId', {
        templateUrl: 'events/eventDetail.html',
        controller: 'EventDetailCtrl',
        resolve: {
          'MomentTimezone': ['MomentTimezone', function (MomentTimezone) {
            return MomentTimezone.promise;
          }]
        }
      })
      .when('/developers/api', {
        templateUrl: 'developer/developer.html',
        controller: 'DeveloperCtrl'
      })
      .when('/statistics', {
        templateUrl: 'developer/gdgStats.html',
        controller: 'GdgStatsCtrl'
      })
      .when('/admin/tags/:tagId', {
        templateUrl: 'admin/editTag.html',
        controller: 'EditTagCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
