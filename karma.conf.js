'use strict';
// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'http://maps.googleapis.com/maps/api/js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-directive.g-signin/google-plus-signin.js',
      'app/bower_components/lodash/dist/lodash.js',
      'app/bower_components/angular-simple-logger/dist/angular-simple-logger.js',
      'app/bower_components/angular-google-maps/dist/angular-google-maps.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/moment/moment.js',
      'app/bower_components/fullcalendar/dist/fullcalendar.js',
      'app/bower_components/angular-ui-calendar/src/calendar.js',
      'app/bower_components/angular-cache/dist/angular-cache.min.js',
      'app/bower_components/angular-google-chart/ng-google-chart.js',
      'app/scripts/hub.module.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'app/about/*.js',
      'app/admin/*.js',
      'app/chapters/*.js',
      'app/dashboard/*.js',
      'app/developer/*.js',
      'app/events/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
