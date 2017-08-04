'use strict';

angular.module('naranawm.sources', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/sources', {
            templateUrl: 'sources/sources.html',
            controller: 'SourcesCtrl'
        });
    }])

    .controller('SourcesCtrl', ["$scope", "Models", function($scope, Models) {
        $scope.sources = Models.query({model: "Source"}, function() {

        }); //query() returns all the entries
    }]);
