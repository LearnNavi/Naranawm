'use strict';

// Declare app level module which depends on views, and components
angular.module('naranawm', [
    'ngRoute',
    'ngResource',
    'ngStorage',
    'naranawm.vezeyko',
    'naranawm.version',
    'ui.bootstrap'
]).config(['$locationProvider', '$routeProvider', '$httpProvider', function ($locationProvider, $routeProvider, $httpProvider) {


    $routeProvider.when('/kelku', {
        templateUrl: 'kelku/kelku.html',
        controller: 'KelkuCtrl'
    });

    $routeProvider.otherwise({redirectTo: '/kelku'});

    $httpProvider.interceptors.push('Interceptors');

}]).run(['$rootScope', '$location', function($rootScope, $location){



}]);
