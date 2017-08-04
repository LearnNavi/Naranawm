'use strict';

// Declare app level module which depends on views, and components
angular.module('naranawm', [
  'ngRoute',
  'ngResource',
  'naranawm.languages',
  'naranawm.sources',
  'naranawm.view1',
  'naranawm.view2',
  'naranawm.version',
  'ui.bootstrap'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/languages'});
}]);
