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
        },
        getComicInformation: function(fileName){

			fileName = fileName.replace(/_/g, " ").replace(/\.[a-z0-9A-Z]+$/g, "");
            var seriesTitle = (fileName.replace(/ (Vol\. ?|Volume )\d+| ?#\d+| \d+ ?|\(.*?\)/ig, "").trim() ? fileName.replace(/ (Vol\. ?|Volume )\d+| ?#\d+| \d+ ?|\(.*?\)/ig, "").trim() : 'Unknown');
            var seriesStartYear = (fileName.match(' ?(\\d{4}) ?') ? fileName.match(' ?(\\d{4}) ?')[1] : new Date().getFullYear());
            var comicIssue = (parseInt(fileName.match('#(\\d+)') ? fileName.match('#(\\d+)')[1] : (fileName.match(' (\\d+) ') ? fileName.match(' (\\d+) ')[1] : 1  ), 10));

            var matchInfo = {
                seriesTitle:seriesTitle,
                seriesStartYear:seriesStartYear,
                comicIssue:comicIssue
            };
            return matchInfo;
        }
    }
});

comiccloudapp.directive('imgFallback', function () {
    var fallbackSrc = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.bind('error', function() {
                angular.element(this).attr("src", "http://placekitten.com/200/287");
            });
        }
    }
    return fallbackSrc;
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
comiccloudapp.directive('ncomicCard', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/ncomicCard.html",
        link: function (scope, elem, attrs) {

        }
    };
});
comiccloudapp.directive('nseriesCard', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/nseriesCard.html",
        link: function (scope, elem, attrs) {

        }
    }
});
comiccloudapp.directive('comicCoverImg', function($window) {
    return {
        restrict: 'E',
        replace: true,
        template: '<img class="comicImg imgHide" ng-src="{{env_var.urlBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
        link: function (scope, elem, attrs) {
            scope.imageId = attrs.imageId;
            elem.bind('load', function () {
                angular.element(this).removeClass('imgHide').siblings('img.comicHoldingImage').addClass('imgHide');
                console.log('image loaded @ ' + attrs.imageId);
            });
            /*setTimeout(function(){
                scope.$apply(function () {
                    elem.attr("ng-src", attrs.waiting);
                });
            }, 3000);*/
            if ($window.innerWidth >= 1200) {
                scope.imageSize = 600;
            } else if ($window.innerWidth < 1200) {
                scope.imageSize = 450;
            }
            angular.element(window).resize(function () {
                scope.$apply(function () {
                    if ($window.innerWidth >= 1200) {
                        scope.imageSize = 600;
                    } else if ($window.innerWidth < 1200) {
                        scope.imageSize = 450;
                    }
                });
            });
        }
    }
});
comiccloudapp.directive('comicPageImg', function($window) {
    return {
        restrict: 'E',
        replace: true,
        template: '<img class="comicImg imgHide" ng-src="{{env_var.urlBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
        link: function(scope, elem, attrs) {
            scope.imageId = attrs.imageId;
            elem.bind('load', function() {
                //angular.element(this).removeClass('imgHide').siblings('img.comicHoldingImage').addClass('imgHide');
                console.log('image loaded @ ' + attrs.imageId);
            });
            if($window.innerWidth >= 1200){
                scope.imageSize = 1500;
            }else if($window.innerWidth < 1200){
                scope.imageSize = 1000;
            }
            angular.element(window).resize(function(){
                scope.$apply(function () {
                    if($window.innerWidth >= 1200){
                        scope.imageSize = 1500;
                    }else if($window.innerWidth < 1200){
                        scope.imageSize = 1000;
                    }
                });
            });
        }
    }
});
comiccloudapp.directive('comicReader', function($window){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/comicReader.html",
        link: function (scope, elem, attrs) {
            setTimeout(function(){console.log(scope.comicLength);}, 3000);
            console.log(scope);
        }
    }
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
comiccloudapp.factory('uploadState', function(){
    var factory = {};
    factory.currentUploads = {};
    factory.progressAverage = function(targetSeriesID) {

        if(!factory.currentUploads.hasOwnProperty(targetSeriesID)){
            return 0;
        } else {
            var lengthOfUploads = Object.keys(factory.currentUploads[targetSeriesID]['comics']).length;
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

