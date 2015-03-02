/**
 * Created by Michael on 17/09/2014.
 */

angular.module('comicCloudClient')
    .controller('ComicController',
        function ($cookies, $http, $location, $rootScope, $scope, $routeParams, Comic, env_var) {

            $rootScope.menu_show = false;
            $rootScope.current_view = "reader";

            $http.defaults.headers.common.Authorization = $cookies.access_token;
            //$http.defaults.cache = true;//Cache every HTTP request
            $scope.cookies = $cookies;
            $scope.env_var = env_var;
            $scope.comic;
            $scope.comicLength;
            //$scope.currentComic = {};
            //$scope.currentComic = [];



            /*$scope.currentlyLoaded = 0;
            $scope.loadTarget = 0;
            $scope.readerStatus = 'loading';
            var initialLoad = 6;*/

            var comic = Comic.get({ id: $routeParams.id }, function() {
                $scope.comic = comic.comic;
                $scope.comicLength = Object.keys($scope.comic.comic_collection).length;
                $scope.loadPages(1, 6);
                /*if ($scope.comicLength <= initialLoad) {
                    //$scope.currentComic = $scope.comic.comic_collection;
                    $scope.loadPages();
                } else {
                    $scope.loadPages(1, initialLoad);
                }*/

            });
            /*$scope.loadPages = function(start, end){
                console.log('loading pages from: ' + start + ' to: ' + end);
                $scope.readerStatus = 'loading-more';

                for (var i = start; i <= end; i++) {
                    //$scope.currentComic[i] = $scope.comic.comic_collection[i];
                    if(i < $scope.comicLength) {
                        $scope.currentComic.push($scope.comic.comic_collection[i]);
                        $scope.loadTarget = end;
                        if (!$scope.$$phase) $scope.$apply(); //TODO: This is pretty hacky. Please fix.
                    }
                }

            };*/



            /*$scope.incrementCurrentlyLoadedCount = function(){
                $scope.currentlyLoaded++;
                if($scope.currentlyLoaded == $scope.loadTarget){
                    console.log('Reader Status: ready');
                    $scope.readerStatus = 'ready';
                    angular.element(".loadingScreen").fadeOut();//TODO: Move to directive.
                }
            }*/




        }
);