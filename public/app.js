var mainmod = angular.module('Instagram', ['satellizer', 'ngMessages', 'ui.router', 'ngResource', 'ngStorage']);

mainmod.config(function ($authProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    var skipIfLoggedIn = function ($q, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
            deferred.reject();
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    var loginRequired = function ($q, $location, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
            deferred.resolve();
        } else {
            $location.path('/login');
        }
        return deferred.promise;
    };

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', {
            url: '/'
            , controller: 'home'
            , templateUrl: '/public/partials/home.html'
        });

    $locationProvider.html5Mode(true);

    $authProvider.github({
        clientId: 'a3f60f1cd9bcec24b539'
    });


})

mainmod.controller('MainCtrl', ['$scope', '$auth', 'Account', '$localStorage', '$sessionStorage', function ($scope, $auth, Account, $localStorage, $sessionStorage) {

    $scope.$storage = $localStorage;
    $scope.authenticate = function (provider) {
        $auth.authenticate(provider).then(function (response) {

            Account.getProfile().then(function (uname) {
                $localStorage.UserName = uname.data;

            })
        });
    }

    $scope.isAuthenticated = function () {
        return $auth.isAuthenticated();
    }

    $scope.logout = function () {
        $auth.logout();
        delete $localStorage.UserName;
    }

}]);