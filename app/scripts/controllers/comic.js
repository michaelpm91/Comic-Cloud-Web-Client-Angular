/**
 * Created by Michael on 17/09/2014.
 */

angular.module('comicCloudClient')
    .controller('ComicController',
        function ($cookies, $http, $location, $scope, $routeParams, Comic, env_var) {
            if(!$cookies.access_token){
                $location.path('/login');
            }

            Number.prototype.clamp = function(min, max) {
                return Math.min(Math.max(this, min), max);
            };

            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.pageSize = 1500;
            $scope.cookies = $cookies;
            $scope.env_var = env_var;
            $scope.comic;
            $scope.comicLength;
            var zoom = false;
            var comic = Comic.get({ id: $routeParams.id }, function() {
                $scope.comic = comic.comic;
                $scope.comicLength = Object.keys($scope.comic.comic_collection).length;
            });

            var page = 1;
            $scope.changePage = function(value){
                angular.element("#comicReader img:nth-child(" + page + ")").removeClass('active');
                page += value;
                page = Math.min(Math.max(page, 1), $scope.comicLength);
                angular.element("#comicReader img:nth-child(" + page + ")").addClass('active');
                if($scope.zoom) window.scrollTo(0,0);
            }

            $scope.zoom = function(){
                zoom = !zoom;
                $scope.$apply(function () {
                    $scope.pageSize = ($scope.pageSize == 1000 ? 1500 : 1000);
                });
                console.log($scope.pageSize);
                angular.element(".comicPage").toggleClass("all zoom");
                angular.element("#comicReader").toggleClass("all zoom");
            }

            var handler = function(e){
                if(e.keyCode === 90) {//Z Key
                    $scope.zoom();
                }
                if(e.keyCode === 37) {//Left
                    $scope.changePage(-1);
                }
                if(e.keyCode === 39) {//Right
                    $scope.changePage(1);
                }
            };

            var $doc = angular.element(document);

            $doc.on('keydown', handler);
            $scope.$on('$destroy',function(){
                $doc.off('keydown', handler);
            })
        }
);