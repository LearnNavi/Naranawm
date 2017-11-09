'use strict';

angular.module('naranawm.vezeyko')
    .controller('LemmasCtrl', ["$scope", "Models", function($scope, Models) {
        $scope.lemmas = Models.query({model: "Lemma"}, function() {

        }); //query() returns all the entries
    }]);
