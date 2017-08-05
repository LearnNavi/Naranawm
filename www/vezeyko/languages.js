'use strict';

angular.module('naranawm.vezeyko')
    .controller('LanguagesCtrl', ["$scope", "Models", function($scope, Models) {
        $scope.languages = Models.query({model: "Language"}, function() {

        }); //query() returns all the entries
    }]);
