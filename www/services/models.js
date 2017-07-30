
angular.module('naranawm').factory('Models', function($resource) {
    return $resource('/api/v1/models/:model/:id'); // Note the full endpoint address
});