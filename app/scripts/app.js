'use strict';

angular.module('gdgxHubApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'd3',
  'moment-timezone',
  'googlechart',
  'ui.calendar',
  'ui.bootstrap',
  'google-maps',
  'gdgxHubApp.directives.gplus',
  'gdgxHubApp.directives.metrics',
  'gdgxHubApp.directives.d3',
  'gdgxHubApp.directives.moment',
  'directive.g+signin'
])
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
          'MomentTimezone': ['MomentTimezone', function(MomentTimezone) {
            return MomentTimezone.promise;
          }]
        }
      })
      .when('/tag/edit/:tag', {
              templateUrl: 'partials/tag_edit',
              controller: 'TagManagementCtrl'
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
  })
  .run(function ($rootScope, $location, $http, $window, Utilities) {
    $rootScope.user = {
          authResult: undefined,
          auth: false,
        };

    $rootScope.toggleMenu = function() {
      if($rootScope.menu_toggle) {
        $rootScope.menu_toggle = "";
      } else {
        $rootScope.menu_toggle = "navbar_open";
      }
    }

    $rootScope.supportsGeo = $window.navigator.geolocation != undefined;

    if($rootScope.supportsGeo) {
      $window.navigator.geolocation.getCurrentPosition(function(position) {
          $rootScope.$apply(function() {
              $rootScope.position = position;
          });
      }, function(error) {
          console.log(error);
      });
    }

    $rootScope.$on('$routeChangeSuccess', function(event) {
      ga('send', 'pageview', {'page': $location.path()});
    });

    $rootScope.$on('event:google-plus-signin-success', function (event,authResult) {
      // Send login to server or save into cookie   $rootScope.$apply(function() {

      Utilities.decodeJwt(authResult['id_token'], function(claims) {
        if(authResult['status']['signed_in']) {
          $http.post('/signin', { code: authResult['code'] }).success(function(data) {

            if(data.user == claims.sub) {
              $http.get('https://www.googleapis.com/plus/v1/people/me?fields=image&key=9MZ8QiVlgHqPrJQXU9I53EiW', { headers: { 'Authorization': "Bearer "+ authResult['access_token']} }).success(function(additional) {
                $rootScope.user = {
                  auth: authResult['status']['signed_in'],
                  authResult: authResult,
                  image: additional.image.url.replace("sz=50","sz=32"),
                  email: claims['email'],
                  userId: claims['sub'],
                  chapters: data.chapters,
                  organizer: (data.chapters.length > 0)
                };
                $rootScope.$broadcast("authenticated");
              });
            } else {
              alert("ID Missmatch");
            }
          });
        }
      });
    });

    $rootScope.$on('event:google-plus-signin-failure', function (event,authResult) {
      // Auth failure or signout detected
      console.log("Auth failed");
      console.log(authResult["error"]);
      $rootScope.$apply(function() {
        $rootScope.user = {
          authResult: authResult,
          auth: false,
        };
      });
    });
  });