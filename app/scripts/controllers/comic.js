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
            $scope.cookies = $cookies;
            $scope.env_var = env_var;
            $scope.comic;
            $scope.comicLength;
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
            }
        }
);