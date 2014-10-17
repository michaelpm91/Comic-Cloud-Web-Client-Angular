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
    'angularFileUpload',
    'ngDialog',
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

comiccloudapp.constant( 'env_var', {
    'urlBase': 'http://dev.atomichael.com/Comic-Cloud-API/api/v1'
});


comiccloudapp.factory('Series', function($resource, $cookies, env_var) {
    var urlBase = env_var.urlBase +'/series/:id';//'http://api.comiccloud.io/0.1/series/:id';
    return $resource(urlBase, {}, {
        update: {
            method: 'PATCH',
            params: {id: '@id'}
        }
    });
});
comiccloudapp.factory('Comic',function($resource, $cookies, env_var) {
    var urlBase = env_var.urlBase + '/comic/:id';//'http://api.comiccloud.io/0.1/comic/:id';
    return $resource(urlBase, {}, {
        update: {
            method: 'PATCH',
            params: { id: '@id'}
        }
    });
});
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
comiccloudapp.directive('comicCard', function(){
    return {
        restrict: 'AE',
        scope: {
            imageUrl : '=imageUrl',
            url : '=url',
            information : '=information',
			seriesId : '=seriesId',
			progressAverage : '='
        },
        templateUrl: "./views/partials/comicCard.html"
    };
});
comiccloudapp.directive('mainMenu', function(){
    return {
        restrict: 'A',
        templateUrl: "./views/partials/mainMenu.html"
    };
});
comiccloudapp.factory('menuState', function(){
	var state = false;
	return{
		state: function() { return state; },
		setState: function(newState) { state = newState }
	};
});
comiccloudapp.factory('page', function() {
	var title = 'default';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
   };
});
comiccloudapp.directive('editSeriesPanel', function(){
    return {
        templateUrl: "./views/partials/editSeriesPanel.html"
    };
});
comiccloudapp.directive('editComicPanel', function(){
    return {
        templateUrl: "./views/partials/editComicPanel.html"
    };
});
comiccloudapp.directive('comicReaderMenu', function(){
    return {
        templateUrl: "./views/partials/comicReaderMenu.html"
    };
});

