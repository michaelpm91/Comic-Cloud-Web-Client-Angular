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

            //$scope.readerStatus = "initial-loading";

            var initialLoad = [1,6];

            var comic = Comic.get({ id: $routeParams.id }, function() {
                $scope.comic = comic.comic;
                $scope.comicLength = Object.keys($scope.comic.comic_collection).length;
                $scope.loadPages(1, 6);
            });
        }
);