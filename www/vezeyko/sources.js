'use strict';

angular.module('naranawm.vezeyko')
    .controller('SourcesCtrl', ["$scope", "Models", function($scope, Models) {
        $scope.sources = Models.query({model: "Source"}, function() {

        }); //query() returns all the entries
    }]);
