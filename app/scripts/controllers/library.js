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
    .controller('LibraryController', ['$cookies', '$location','$scope', 'dataFactory',
        function ($cookies, $location, $scope, dataFactory) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
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
        }
    ]
);
