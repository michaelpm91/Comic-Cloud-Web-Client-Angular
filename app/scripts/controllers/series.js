/**
 * Created by Michael on 17/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('SeriesController', ['$cookies', '$http', '$location', '$scope', '$rootScope', '$routeParams', 'ngDialog', 'Series', 'Comic',
        function ($cookies, $http, $location, $scope, $rootScope, $routeParams, ngDialog, Series, Comic) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.targetId;
            $scope.series;
            var series = Series.get({ id: $routeParams.id }, function() {
                $scope.series = series.series;
            });

            $scope.openDeleteModal = function () {
                console.log($scope.targetId);
                ngDialog.open({
                    template: './views/directives/deleteModal.html',
                    scope: $scope,
                    data : {
                        type : 'comic'
                    }
                });
            };
            $scope.deleteThis = function(comicId) {
                Comic.delete({id:comicId}, function(){
                    console.log('Comic ' + comicId + ' deleted.');
                    angular.element('#comic_' + comicId).fadeOut(function(){
                       this.remove();
                    });
                });
            }
        }]);
