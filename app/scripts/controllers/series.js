/**
 * Created by Michael on 17/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('SeriesController', ['$scope', '$routeParams', 'dataFactory',
        function ($scope, $routeParams, dataFactory) {

            $scope.comics;

            getSeries($routeParams.id);

            function getSeries(val) {
                dataFactory.getSeries(val)
                    .success(function (series) {
                        $scope.comics = series.series;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load customer data: ' + error.message;
                    });
            }
        }]);
