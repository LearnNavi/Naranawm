'use strict';

angular.module('naranawm.languages', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/languages', {
            templateUrl: 'languages/languages.html',
            controller: 'LanguagesCtrl'
        });
    }])

    .controller('LanguagesCtrl', ["$scope", "Models", function($scope, Models) {
        $scope.languages = Models.query({model: "Language"}, function() {

        }); //query() returns all the entries
    }]);
