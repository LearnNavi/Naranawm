'use strict';
// Vezeyko: Put in order / be organized
// This is the dictionary management section of Naranawm
angular.module('naranawm.vezeyko', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){

        $routeProvider.when('/vezeyko', {
            templateUrl: 'vezeyko/vezeyko.html',
            controller: 'VezeykoCtrl'
        });

        $routeProvider.when('/vezeyko/:language', {
            templateUrl: 'vezeyko/dashboard.html',
            controller: 'DashboardCtrl'
        });

        $routeProvider.when('/vezeyko/:language/languages', {
            templateUrl: 'vezeyko/languages.html',
            controller: 'LanguagesCtrl'
        });

        $routeProvider.when('/vezeyko/:language/lemmas', {
            templateUrl: 'vezeyko/lemmas.html',
            controller: 'LemmasCtrl'
        });

        $routeProvider.when('/vezeyko/:language/sources', {
            templateUrl: 'vezeyko/sources.html',
            controller: 'SourcesCtrl'
        });
    }])
    .controller('VezeykoCtrl', ["$scope", "$location", function($scope, $location) {

        // TODO: Hook this up to a list of languages that we support
        // If only 1 language defined, go ahead and switch to that language
        $scope.languages = ["nav"];
        console.log("Test");
        if($scope.languages.length === 1){
            $location.path('/vezeyko/' + $scope.languages[0]);
        }
    }]);
