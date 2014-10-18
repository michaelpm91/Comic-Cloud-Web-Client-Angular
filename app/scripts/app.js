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
    'ngDialog'
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
comiccloudapp.directive('comicCard', function(uploadState){
    return {
        restrict: 'AE',
        scope: {
            imageUrl : '=imageUrl',
            url : '=url',
            information : '=information',
			seriesId : '=seriesId',
            uploadProgress : '='
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
/*comiccloudapp.service('uploadState', function() {
    this.userData = {yearSetCount: 0};

    this.user = function() {
        return this.userData;
    };

    this.setEmail = function(email) {
        this.userData.email = email;
    };

    this.getEmail = function() {
        return this.userData.email;
    };

    this.setSetCount = function(setCount) {
        this.userData.yearSetCount = setCount;
    };

    this.getSetCount = function() {
        return this.userData.yearSetCount;
    };
});*/
comiccloudapp.factory('uploadState', function(){
    var factory = {};
    factory.currentUploads = {};
    factory.progressAverage = function(targetSeriesID) {

        if(!factory.currentUploads.hasOwnProperty(targetSeriesID)){
            return 0;
        } else {
            //console.log('not empty');
            var lengthOfUploads = Object.keys(factory.currentUploads[targetSeriesID]).length;
            var total = 0;
            if (lengthOfUploads == 0) return 0;
            angular.forEach(factory.currentUploads[targetSeriesID]['comics'], function (value, key) {
                total += parseInt(value['progress']);
            });
            var finalTotal = total / (lengthOfUploads * 100) * 100;

            return finalTotal;
        }
    }
    return factory;
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

