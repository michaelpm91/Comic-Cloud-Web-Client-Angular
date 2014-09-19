/**
 * Created by Michael on 17/09/2014.
 */

/**
 * @ngdoc function
 * @name comicCloudClientApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the comicCloudClientApp
 */
angular.module('comicCloudClient')
    .controller('ComicController', ['$scope', '$routeParams', 'dataFactory',
        function ($scope, $routeParams, dataFactory) {

            $scope.comic;

            getComic($routeParams.id);

            function getComic(val) {
                dataFactory.getComic(val)
                    .success(function (comic) {
                        $scope.comic = comic.comic;
                    })
                    .error(function (error) {
                        $scope.status = 'Unable to load customer data: ' + error.message;
                    });
            }
        }
    ]
);