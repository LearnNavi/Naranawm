'use strict';

angular.module('naranawm')
    .controller('LoginCtrl', ["Auth", "$scope", function(Auth, $scope) {
        $scope.form = {};

        $scope.login = function(){
            Auth.login($scope.form, function(){
                // Success
                console.log("Success");
            }, function(error){
                // Error
                console.log(error);
            });
        };

        $scope.showLoginForm = function(){
            return $scope.user.id === undefined;
        }
    }]);
