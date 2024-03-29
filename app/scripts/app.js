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
    'routeStyles'
]);

/**
 * Config
 */
comiccloudapp.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/library', {
            templateUrl: './views/library.html',
            controller: 'LibraryController',
            css: ['./styles/css/modules/library/style.css', './styles/css/modules/menu-library/style.css'],
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/s/:id', {
            templateUrl: './views/series.html',
            controller: 'SeriesController',
            css: ['./styles/css/modules/library/style.css', './styles/css/modules/menu/style.css'],
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/c/:id', {
            templateUrl: './views/comic.html',
            controller: 'ComicController',
            css: ['./styles/css/modules/reader/style.css', './styles/css/modules/menu/style.css'],
            resolve : {
                auth : function(AuthService){
                    return AuthService.authenticate();
                }
            }
        })
        .when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController',
            css: './styles/css/modules/login/style.css',
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

    /*$httpProvider.responseInterceptors.push(function($cookies, $q, $injector, $location, env_var){
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
                        if (loginResponse.data && loginResponse.status != 401) {
                            //$cookies.access_token = response.config.headers.Authorization = loginResponse.access_token;
                            // now let's retry the original request - transformRequest in .run() below will add the new OAuth token
                            $cookies.access_token = response.config.headers.Authorization = loginResponse.data.access_token;
                            $injector.get("$http")(response.config).then(function(response) {
                                // we have a successful response - resolve it using deferred
                                deferred.resolve(response);
                            },function(response) {
                                console.log('wrong');
                                deferred.reject(); // something went wrong
                            });
                        } else {
                            console.log('deferred');
                            deferred.reject(); // login.json didn't give us data
                        }
                    }, function(response) {
                        deferred.reject(); // token retry failed, redirect so user can login again
                        $location.path('/');
                        return;
                    });
                    return deferred.promise; // return the deferred promise
                }else if(response.status===401 && response.data.error === "invalid_request"){
                    $cookies.access_token = $cookies.refresh_token = null;
                    $location.path('/');
                }
                return $q.reject(response); // not a recoverable error
            });
        };
    });*/

});

/**
 * Filters
 */
comiccloudapp.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for(var i in input){
            out.push(input[i]);
        }
        return out;
    }
});


/**
 * Constants
 */
comiccloudapp.constant( 'env_var', {
    apiBase : 'http://api.dev.comiccloud.io/v1',
    clientBase : '',
    imgHolder : '/images/comicHolder.gif'
});

/**
 * Factories
 */
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

/**
 * Directives
 */
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

comiccloudapp.directive('comicCard', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/comicCard.html",
        link: function (scope, elem, attrs) {

        }
    };
});

comiccloudapp.directive('seriesCard', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/seriesCard.html",
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

        }
    }
});

comiccloudapp.directive('comicPageImg', function($window, $document) {
    return {
        restrict: 'E',
        replace: true,
        template: '<img class="comicImg" ng-src="{{env_var.apiBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
        link: function(scope, elem, attrs) {

            //Image Ready
            scope.imageId = attrs.imageId;
            elem.bind('load', function() {
                console.log('image loaded @ ' + attrs.imageId);
                //angular.element(this).removeClass('imgHide').siblings('img.comicHoldingImage').addClass('imgHide');
                scope.incrementCurrentlyLoadedCount();
                if(angular.element(this).index() === 0) angular.element(this).addClass('active');

            });

            //Draggable
            var startX = 0, startY = 0, x = 0, y = 0;
            elem.css({
                position: 'relative',
                border: '1px solid red',
                cursor: 'pointer'
            });

            elem.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;

                var maskWidth  = angular.element("#comicReader").width();//$("#my-mask").width();
                var maskHeight = angular.element("#comicReader").height();//$("#my-mask").height();
                var imgPos     = elem.offset();//$("#my-image").offset();
                var imgWidth   = elem.width();//$("#my-image").width();
                var imgHeight  = elem.height();//$("#my-image").height();

                var x1 = imgPos.left;
                var y1 = imgPos.top;
                var x2 = (imgPos.left + maskWidth) - imgWidth;
                var y2 = (imgPos.top + maskHeight) - imgHeight;

                if( y1 >= 0 || y2 <= 0) y = 0;

                if( x1 <= 0) x = 2 - ((maskWidth /2 ) - (imgWidth / 2));//(0 - (imgWidth * 2.5));


                //if( x2 == maskWidth) x = maskWidth;

                console.log('x:' + x + ' y:' + y + ' x1: '+ x1 +' y1: ' + y1 + ' x2: ' + x2 + ' y2: '+ y2);

                elem.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }


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

comiccloudapp.directive('menuLibrary', function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/menu-library.html"
    };
});

comiccloudapp.directive('menuComic', function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/menu-comic.html"
    };
});

comiccloudapp.directive('menuComicNav', function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "./views/partials/menu-comic-nav.html"
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