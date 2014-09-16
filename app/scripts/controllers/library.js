/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

/**
 * @ngdoc function
 * @name comicCloudClientApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the comicCloudClientApp
 */
angular.module('comicCloudClient')
    .controller('LibraryController', ['$scope', 'dataFactory',
        function ($scope, dataFactory) {

            $scope.series;

            getAllSeries();

            function getAllSeries() {
                dataFactory.getAllSeries()
                    .success(function (series) {
                        $scope.series = series.series;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load customer data: ' + error.message;
                    });
            }
        }]);
