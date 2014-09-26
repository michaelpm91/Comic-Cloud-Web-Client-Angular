/**
 * Created by Michael on 17/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('SeriesController', ['$cookies', '$http', '$location', '$scope', '$rootScope', '$routeParams', 'Series',
        function ($cookies, $http, $location, $scope, $rootScope, $routeParams, Series) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.series;
            var series = Series.get({ id: $routeParams.id }, function() {
                $scope.series = series.series;
            });
        }]);
