
angular.module('naranawm').factory('Auth', ['$rootScope', '$http', '$localStorage', '$location', '$q', function ($rootScope, $http, $localStorage, $location, $q) {

    function changeUser(user) {
        angular.extend($rootScope.user, user);
    }

    function urlBase64Decode(str) {
        let output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function getUserFromToken() {
        const token = $localStorage.token;
        let user = {};
        if (typeof token !== 'undefined') {
            const encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;
    }

    $rootScope.user = getUserFromToken();

    return {
        login: function(data, success, error){
            "use strict";
            $http.post("/login", data).then(function(res){
                $localStorage.token = res.data.token;
                $rootScope.user = getUserFromToken();
                $location.path("/vezeyko");
                success();
            }, error);
        },
        logout: function(success){
            "use strict";
            changeUser({});
            delete $localStorage.token;
            success();
        }
    };
}]);