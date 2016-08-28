'use strict';

describe('Controller: MainController', function () {

  // load the controller's module
  beforeEach(module('gdgxHubApp'));

  var mainController, scope, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    mainController = $controller('MainController');
    console.log('MainController: ' + JSON.stringify(mainController));
  }));

  it('should exist', function () {
    console.log('MainController1: ' + JSON.stringify(mainController));
    expect(mainController).toBeDefined();
  });
});
