'use strict';

// Declare app level module which depends on views, and components
angular.module('naranawm', [
  'ngRoute',
  'naranawm.view1',
  'naranawm.view2',
  'naranawm.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
