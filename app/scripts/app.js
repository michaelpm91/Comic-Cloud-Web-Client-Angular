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

comiccloudapp.factory('Series', function($cacheFactory, $resource, $cookies, env_var) {
    var urlBase = env_var.apiBase +'/series/:id';//'http://api.comiccloud.io/0.1/series/:id';
    return $resource(urlBase, {}, {
        update: {
            method: 'PATCH',
            params: {id: '@id'},
            cache : true
        }
    });
});

comiccloudapp.factory('Comic',function($cacheFactory, $resource, $cookies, env_var) {
    var urlBase = env_var.apiBase + '/comic/:id';//'http://api.comiccloud.io/0.1/comic/:id';
    return $resource(urlBase, {}, {
        update: {
            method: 'PATCH',
            params: { id: '@id'},
            cache : true
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
        }
    }
});


comiccloudapp.directive('comicReader', function($window, $document, $location){
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: "./views/partials/comicReader.html",
        controller: function($scope) {
            $scope.readerStatus = "initial-loading";

            //$scope.page = 1;
            $scope.currentPage = 1;
            $scope.zoomLevel = 1;
            $scope.currentComic = [];
            $scope.currentlyLoaded = 0;
            $scope.loadTarget = 0;

            $scope.currentImagePosition = {'x': 0, 'y' : 0};
            var loadingOffset = 6;
            var minZoomLevel = 1;
            var maxZoomLevel = 7;



            $scope.loadPages = function(start, end){//Mutator Method
                if($scope.currentlyLoaded != $scope.loadTarget) return;
                console.log('loading pages from: ' + start + ' to: ' + end);
                $scope.loadTarget = end;
                if(start !== 1) $scope.setReaderStatus('loading');

                for (var i = start; i <= end; i++) {
                    if(i < $scope.comicLength) {
                        $scope.currentComic.push($scope.comic.comic_collection[i]);
                        if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
                    }
                }
            };

            $scope.setCurrentlyLoaded = function(){//Mutator Method
                $scope.currentlyLoaded++;
                if($scope.currentlyLoaded == $scope.loadTarget){
                    //console.log('Reader Status: ready');
                    $scope.setReaderStatus('ready');
                }
                if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
            };

            $scope.setPage = function(value){//Mutator Method
                $scope.currentPage += value;
                $scope.currentPage = Math.min(Math.max($scope.currentPage, 1), $scope.comicLength);

                if(($scope.currentPage + 2) == $scope.currentlyLoaded) $scope.loadPages(($scope.currentlyLoaded + 1), (($scope.currentlyLoaded + 1 ) + loadingOffset));

                if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
            };
            $scope.setZoomLevel = function(value){
                if(value == 'reset'){
                    $scope.zoomLevel = 1;
                }else {
                    $scope.zoomLevel += value;
                    $scope.zoomLevel = Math.min(Math.max($scope.zoomLevel, minZoomLevel), maxZoomLevel);
                }
                if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
            };

            $scope.setImagePosition = function (x, y){//Mutator Method
                $scope.currentImagePosition.x = x;
                $scope.currentImagePosition.y = y;
                if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
            };

            $scope.setReaderStatus = function(value){
                $scope.readerStatus = value;
                if (!$scope.$$phase) $scope.$apply(); //TODO: Find a better way to do this.
            };

        },
        link: function (scope, elem, attrs) {

            elem.focus();//Make sure user can navigate straight away.

            elem.click(function(){//Consider moving this over to an ng-click directive.
                angular.element('.menu-comic, .menu-comic-nav').fadeToggle('150');
            });

            angular.element(document).on("keyup", function (e) {
                if(e.keyCode === 37) {//Left
                    scope.changePage(-1);
                }
                if(e.keyCode === 39) {//Right
                    scope.changePage(+1);
                }
                if(e.keyCode === 90){//Z
                    scope.zoomPage(+1);
                }
                if(e.keyCode === 88){//X
                    scope.zoomPage(-1);
                }
                if(e.keyCode === 27){//Esc
                    //Not convinced any of this is necessary
                    $location.path('/s/' + scope.comic.series.id);
                    if(!scope.$$phase) scope.$apply(); //TODO: Find a better way to do this.
                    //TODO: Logic to escape to the right place. History should be altered too
                }

            });



            scope.changePage = function(value){
                if(scope.readerStatus == 'initial-loading'){
                    console.log('intial loading... Locked controls.');
                }else{
                    var currentPage = scope.currentPage;
                    scope.setPage(value);
                    var nextPage = scope.currentPage;
                    if (currentPage != nextPage) angular.element("#comicReader .comicImg.active").css('transform', '');

                    if(nextPage >= scope.currentlyLoaded){
                        scope.setReaderStatus("current-page-loading");
                    }else{
                        scope.setReaderStatus("loading");
                    }
                    angular.element("#comicReader .comicImg").removeClass('active grab');
                    scope.setZoomLevel('reset');
                    angular.element("#comicReader .comicImg:nth-child(" + nextPage + ")").addClass('active');
                }
            };

            scope.zoomPage = function(value){
                var currentZoomLevel = scope.zoomLevel;
                scope.setZoomLevel(value);
                var newZoomLevel = scope.zoomLevel;
                var tmp = angular.element("#comicReader .comicImg.active");
                //tmp.css('transform',"scale(" + newZoomLevel + "," + newZoomLevel + ")");
                //angular.element('#comicReader .comicImg.active.imgZoom').css('transform',"scale(" + newZoomLevel + "," + newZoomLevel + ")");

                if(newZoomLevel == 1){
                    scope.setImagePosition(0,0);
                    tmp.css("transform","translate(0px, 0px) scale(" + newZoomLevel + ", " + newZoomLevel + ")");
                }else{
                    tmp.css("transform","translate(" + scope.currentImagePosition.x + "px, " + scope.currentImagePosition.y + "px)  scale(" + newZoomLevel + ", " + newZoomLevel + ")");
                }
            };
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

comiccloudapp.directive('comicPageImg', function($window, $document) {
    return {
        restrict: 'E',
        replace: true,
        //require: '^comicReader',
        template: '<img class="comicImg" ng-src="{{env_var.apiBase}}{{imageId}}/{{imageSize}}?access_token={{cookies.access_token}}">',
        link: function(scope, elem, attrs) {

            //Image Ready
            scope.imageId = attrs.imageId;
            elem.bind('load', function() {
                console.log('image loaded @ ' + attrs.imageId);
                //angular.element(this).removeClass('imgHide').siblings('img.comicHoldingImage').addClass('imgHide');
                scope.setCurrentlyLoaded();
                if(angular.element(this).index() === 0) angular.element(this).addClass('active');

            });

            //Draggable
            var startX = 0, startY = 0, x = 0, y = 0;
            elem.css({
                position: 'relative',
                //border: '1px solid red',
                //cursor: 'pointer'
            });

            elem.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                elem.addClass('grab');
                event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                if(scope.zoomLevel > 0) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;

                    var maskWidth = angular.element("#comicReader").width();
                    var maskHeight = angular.element("#comicReader").height();
                    var imgPos = elem.offset();
                    var imgWidth = (elem.width() * (scope.zoomLevel > 0 ? scope.zoomLevel : 1 ));
                    var imgHeight = (elem.height() * (scope.zoomLevel > 0 ? scope.zoomLevel : 1 ));

                    var x1 = imgPos.left;
                    var y1 = imgPos.top;
                    var x2 = imgPos.left + imgWidth;
                    var y2 = imgPos.top + imgHeight;
                    //var x2 = (imgPos.left + maskWidth) - (imgWidth * (scope.zoomLevel >= 1 ? scope.zoomLevel : 1 ));
                    //var y2 = (imgPos.top + maskHeight) - (imgHeight * (scope.zoomLevel >= 1 ? scope.zoomLevel : 1 ));

                    //Lock X axis if image isn't greater than container
                    //if(imgWidth < maskWidth) x = 0;

                    //if(x1 > (maskWidth/2)) x = maskWidth/2;
                    //if(x1 < 0) x1 = 0;
                    //if (scope.zoomLevel == 1) {
                        //if (imgWidth < maskWidth) x = 0;
                        //x = y= 0;
                    //} else {

                        if (x >= (maskWidth / 2) - (imgWidth / 2)) {
                            x = (maskWidth / 2) - (imgWidth / 2) - 1;
                        }
                        if (x <= (0 - maskWidth / 2) + (imgWidth / 2)) {
                            x = (0 - maskWidth / 2) + (imgWidth / 2) + 1;
                        }
                        //Lock X axis if image isn't greater than container
                        //if(imgWidth < maskWidth) x = 0;

                        if(y <= (maskHeight/2) - (imgHeight/2)){
                            y = (maskHeight/2) - (imgHeight/2);
                        }
                        if(y >= (imgHeight/2) - (maskHeight/2)){
                            y =  (imgHeight/2) - (maskHeight/2);
                        }
                    //}

                    //if(imgWidth * scope.zoomLevel < maskWidth)
                    console.log('x:' + x + ' y:' + y + ' x1: ' + x1 + ' y1: ' + y1 + ' x2: ' + x2 + ' y2: ' + y2);

                    elem.css({
                        "transform": "translate(" + x + "px, " + y + "px) scale(" + scope.zoomLevel + ", " + scope.zoomLevel + ")"
                    });
                }
            }

            function mouseup() {
                elem.removeClass('grab');
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    }
});



comiccloudapp.directive('readerLoadingScreen', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="readerLoadingScreen"></div>',
        require: '^comicReader',
        link: function (scope, elem, attrs) {
            var rls = angular.element('.readerLoadingScreen');
            scope.$watch('readerStatus', function() {
                //console.log('Reader Status has changed.');
                console.log('%c Reader Status has changed to: ' + scope.readerStatus, 'background: #222; color: #bada55');

                if(scope.readerStatus == "initial-loading"){
                    rls.fadeIn();
                    console.log('activate loading screen');
                }else if(scope.readerStatus == "loading") {
                    rls.fadeOff();
                    console.log('loading background...');
                }else if(scope.readerStatus == "current-page-loading"){
                    rls.fadeIn();
                    console.log('loading background...');
                }else if(scope.readerStatus == "ready"){
                    rls.fadeOut();
                    console.log('deactivate loading screen');
                }else{
                    console.log('nothing to report today captain');
                    rls.fadeOut();
                }
            });

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
