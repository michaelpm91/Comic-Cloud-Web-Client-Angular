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
    .controller('ComicController', ['$cookies', '$location', '$scope', '$routeParams', 'dataFactory',
        function ($cookies, $location, $scope, $routeParams, dataFactory) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
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