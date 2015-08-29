'use strict';

angular.module('gdgxHubApp')
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'partials/dashboard',
        controller: 'DashboardCtrl'
      })
      .when('/about', {
        templateUrl: 'partials/about',
        controller: 'AboutCtrl'
      })
      .when('/chapters', {
        templateUrl: 'partials/chapters',
        controller: 'ChapterCtrl'
      })
      .when('/chapters/country/:country', {
        templateUrl: 'partials/chapter_country',
        controller: 'ChapterCountryCtrl'
      })
      .when('/chapters/:chapterId', {
        templateUrl: 'partials/chapter',
        controller: 'ChapterDetailCtrl'
      })
      .when('/chapters/:chapterId/metrics', {
        templateUrl: 'partials/chapter_metrics',
        controller: 'ChapterMetricsCtrl'
      })
      .when('/events', {
        templateUrl: 'partials/events',
        controller: 'EventCtrl'
      })
      .when('/events/devfest', {
        templateUrl: 'partials/devfest'
      })
      .when('/events/heatmap/:year/:month', {
        templateUrl: 'partials/events_heatmap',
        controller: 'EventsHeatmapCtrl'
      })
      .when('/events/tags', {
        templateUrl: 'partials/events',
        controller: 'EventCtrl'
      })
      .when('/events/tags/:tag', {
        templateUrl: 'partials/events',
        controller: 'EventCtrl'
      })
      .when('/events/:eventId', {
        templateUrl: 'partials/event',
        controller: 'EventDetailCtrl',
        resolve: {
          'MomentTimezone': ['MomentTimezone', function (MomentTimezone) {
            return MomentTimezone.promise;
          }]
        }
      })
      .when('/developers/api', {
        templateUrl: 'partials/api',
        controller: 'ApiCtrl'
      })
      .when('/statistics', {
        templateUrl: 'partials/gdg_stats',
        controller: 'GdgStatsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
