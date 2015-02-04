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
            controller: 'LibraryController',
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/s/:id', {
            templateUrl: './views/series.html',
            controller: 'SeriesController',
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/c/:id', {
            templateUrl: './views/comic.html',
            controller: 'ComicController',
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController',
            resolve: {
                auth: function (AuthService) {
                    return AuthService.redirectIfAuthenticated('/library');
                }
            }
        })
        .otherwise({
            redirectTo: '/library'
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    /*$httpProvider.interceptors.push(function($q, $cookies, $location, $injector) {
        return {
            'responseError': function(rejection) {
                // do something on error
                //console.log(rejection);
                if(rejection.status == 401){
                    if($cookies.refresh_token){
                        //var $http = $injector.get('$http');

                        //$http.get('/');
                        console.log(rejection.config);
                        //return $http(rejection.config);
                        var $http = $injector.get('$http');

                        var data = {
                            'grant_type' : 'refresh_token',
                            'client_id' : '1',
                            'client_secret' : 'secret',
                            'refresh_token' : $cookies.refresh_token
                        };
                        $http({
                            method  : 'POST',
                            url     : 'http://dev.atomichael.com/Comic-Cloud-API/oauth/access_token',
                            data    : $.param(data),
                            headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                        }).success(function(data) {
                            $cookies.access_token = data.access_token;
                            //$location.path("/library");
                            console.log(rejection.config.headers.Authorization);
                            console.log(data.access_token);
                            rejection.config.headers.Authorization = data.access_token;
                            return $http(rejection.config);
                        }).error(function(){
                            //$cookies.access_token = $cookies.refresh_token = undefined;
                            $location.path("/");
                        });

                    }
                }
            }
        };
    });*/
    $httpProvider.responseInterceptors.push(function($cookies, $q, $injector, $location, env_var){
            return function(promise) {
                return promise.then(function(response) {
                    return response; // no action, was successful
                }, function (response) {
                    // error - was it 401 or something else?
                    //if (response.status===401 && response.data.error && response.data.error === "invalid_token") {
                    if (response.status===401){
                        var deferred = $q.defer(); // defer until we can re-request a new token
                        // Get a new token... (cannot inject $http directly as will cause a circular ref)
                        var data = {
                            'grant_type' : 'refresh_token',
                            'client_id' : '1',
                            'client_secret' : 'secret',
                            'refresh_token' : $cookies.refresh_token
                        };
                        $injector.get('$http')({
                            method  : 'POST',
                            url     : env_var.apiBase + '/oauth/access_token',
                            data    : $.param(data),
                            headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                        }).then(function(loginResponse) {
                            console.log(loginResponse);
                            if (loginResponse.data) {
                                //$cookies.access_token = response.config.headers.Authorization = loginResponse.access_token;
                                // now let's retry the original request - transformRequest in .run() below will add the new OAuth token
                                $cookies.access_token = response.config.headers.Authorization = loginResponse.data.access_token;
                                $injector.get("$http")(response.config).then(function(response) {
                                    // we have a successful response - resolve it using deferred
                                    deferred.resolve(response);
                                },function(response) {
                                    deferred.reject(); // something went wrong
                                });
                            } else {
                                deferred.reject(); // login.json didn't give us data
                            }
                        }, function(response) {
                            deferred.reject(); // token retry failed, redirect so user can login again
                            $location.path('/');
                            return;
                        });
                        return deferred.promise; // return the deferred promise
                    }
                    return $q.reject(response); // not a recoverable error
                });
            };
        });

});


comiccloudapp.factory('AuthService', function($q, $cookies, $location){
    return {
        authenticate : function(){

            var deferred = $q.defer();

            if(!$cookies.access_token) {
                deferred.reject()
                $location.path('/login');
            } else {
                deferred.resolve()
            }

            return deferred.promise;
        },
        redirectIfAuthenticated : function(route){

            var deferred = $q.defer();

            if ($cookies.access_token) {
                deferred.reject()
                $location.path(route);
            } else {
                deferred.resolve()
            }

            return deferred.promise;

        }

    }
});

comiccloudapp.constant( 'env_var', {
    apiBase : 'http://dev.atomichael.com/Comic-Cloud-API/api/v1',
    clientBase : ''
});


comiccloudapp.factory('Series', function($resource, $cookies, env_var) {
    var urlBase = env_var.apiBase +'/series/:id';//'http://api.comiccloud.io/0.1/series/:id';
    return $resource(urlBase, {}, {
        update: {
            method: 'PATCH',
            params: {id: '@id'}
        }
    });
});
comiccloudapp.factory('Comic',function($resource, $cookies, env_var) {
    var urlBase = env_var.apiBase + '/comic/:id';//'http://api.comiccloud.io/0.1/comic/:id';
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
        template: '<img class="comicImg imgHide" ng-src="{{env_var.apiBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
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
        template: '<img class="comicImg" ng-src="{{env_var.apiBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
        link: function(scope, elem, attrs) {
            scope.imageId = attrs.imageId;
            elem.bind('load', function() {
                console.log('image loaded @ ' + attrs.imageId);
                //angular.element(this).removeClass('imgHide').siblings('img.comicHoldingImage').addClass('imgHide');
                scope.incrementCurrentlyLoadedCount();
                if(angular.element(this).index() === 0) angular.element(this).addClass('active');

            });

            //angular.element("#comicReader img").first().removeClass('imgHide');

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
comiccloudapp.directive('loadingScreen', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="loadingScreen"></div>',
        link: function (scope, elem, attrs) {
            scope.$watch('readerStatus', function() {

                //console.log('Reader Status has changed.');
                console.log('%c Reader Status has changed to: ' + scope.readerStatus, 'background: #222; color: #bada55');
            });

        }
    }
});

comiccloudapp.directive('comicReaderControls', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/comicReaderControls.html",
        link: function (scope, elem, attrs) {

        }
    }
});

comiccloudapp.directive('comicReader', function($window){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/comicReader.html",
        link: function (scope, elem, attrs) {
            //setTimeout(function(){console.log(scope.comicLength);}, 3000);
            //console.log(scope);
            //setTimeout(function(){console.log(scope.currentlyLoaded);}, 3000);
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

