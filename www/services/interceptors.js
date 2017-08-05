
angular.module('naranawm').factory('Interceptors', ['$localStorage', '$location', '$q', function ($localStorage, $location, $q) {

    return  {
        'request': function (config) {
            config.headers = config.headers || {};
            if ($localStorage.token) {
                config.headers.Authorization = 'JWT ' + $localStorage.token;
            }
            return config;
        },
        'responseError': function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/signin');
            }
            return $q.reject(response);
        }
    };
}]);