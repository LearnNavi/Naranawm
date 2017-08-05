'use strict';

angular.module('naranawm.vezeyko')
    .controller('DashboardCtrl', ["$scope", "$routeParams", function($scope, $routeParams) {
        $scope.language = $routeParams.language;
    }]);
