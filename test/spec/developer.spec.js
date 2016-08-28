'use strict';

describe('Controller: ApiCtrl', function() {

  // load the controller's module
  beforeEach(module('gdgxHubApp'));

  var apiCtrl, scope, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    apiCtrl = $controller('ApiCtrl', {
      $scope: scope
    });

    $httpBackend.expectGET('/api/v1/rest').respond({
      baseUrl: 'https://hub.gdgx.io/api/v1/',
      description: 'Everything GDG',
      kind: 'discovery#restDescription',
      name: 'hub',
      ownerDomain: 'hub.gdgx.io',
      ownerName: 'GDG[x]'
    });
  }));

  it('should set the API Docs data on the scope', function() {
    expect(scope.restDiscovery).toBeUndefined();
    $httpBackend.flush();
    expect(scope.restDiscovery.name).toBe('hub');
  });
});
