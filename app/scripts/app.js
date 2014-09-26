/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

var comiccloudapp = angular.module('comicCloudClient', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularFileUpload'
]);
comiccloudapp.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/library', {
            templateUrl: './views/library.html',
            controller: 'LibraryController'
        })
        .when('/s/:id', {
            templateUrl: './views/series.html',
            controller: 'SeriesController'
        })
        .when('/c/:id', {
            templateUrl: './views/comic.html',
            controller: 'ComicController'
        })
        .when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/library'
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);

});

comiccloudapp.run(function($rootScope) {
    $rootScope.urlBase = 'http://dev.atomichael.com/Comic-Cloud-API/api/v1';
    //$rootScope.urlBase = 'http://api.comiccloud.io/0.1';
});
comiccloudapp.factory('Series', ['$resource', '$cookies', '$rootScope', function($resource, $cookies, $rootScope) {
    var urlBase = $rootScope.urlBase +'/series/:id';//'http://api.comiccloud.io/0.1/series/:id';
    return $resource(urlBase);
}]);
comiccloudapp.factory('Comic', ['$resource', '$cookies', '$rootScope', function($resource, $cookies, $rootScope) {
    var urlBase = $rootScope.urlBase + '/comic/:id';//'http://api.comiccloud.io/0.1/comic/:id';
    return $resource(urlBase);
}]);
comiccloudapp.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for(var i in input){
            out.push(input[i]);
        }
        return out;
    }
});
comiccloudapp.factory('comicFunctions', function () {
    return {
        genID: function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 40; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }
    }
});
comiccloudapp.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});