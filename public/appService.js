mainmod.factory('Account', ['$http', function ($http) {

    return {
        getProfile: function () {
            return $http.get('/api/me');
        }


    };

}]);