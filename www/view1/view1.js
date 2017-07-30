'use strict';

angular.module('naranawm.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  console.log("1");
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ["$scope", "Models", function($scope, Models) {
    $scope.lemmas = Models.query({model: "Lemma"}, function() {
        console.log($scope.lemmas);
    }); //query() returns all the entries
}]);