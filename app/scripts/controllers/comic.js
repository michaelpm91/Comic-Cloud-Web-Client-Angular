/**
 * Created by Michael on 17/09/2014.
 */

angular.module('comicCloudClient')
    .controller('ComicController',
        function ($cookies, $http, $location, $scope, $routeParams, Comic, env_var) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.env_var = env_var;
            $scope.comic;
            var comic = Comic.get({ id: $routeParams.id }, function() {
                $scope.comic = comic.comic;
            });
            var page = 1;
            $scope.click = function(){
                angular.element("#comicReader img:nth-child(" + page + ")").removeClass('active');
                page++;
                angular.element("#comicReader img:nth-child(" + page + ")").addClass('active');
                console.log(page);
            }
        }
);