/**
 * Created by Michael on 17/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('SeriesController', function ($cookies, $http, $location, $scope, $compile, $rootScope, $routeParams, comicFunctions, ngDialog, $upload, Series, Comic, env_var, uploadState) {
        if (!$cookies.access_token) {
            $location.path('/login');
        }
        $http.defaults.headers.common.Authorization = $cookies.access_token;
        $scope.cookies = $cookies;
        $scope.targetId;
        $scope.env_var = env_var;
        $scope.comicUpdate = {};

        $scope.uploadState = uploadState;
        console.log($scope.uploadState);

        $scope.series;
        var series = Series.get({ id: $routeParams.id }, function () {
            $scope.series = series.series;
        });


        $scope.openEditModal = function () {
            $scope.targetId;
            console.log($scope.targetId);
            console.log($scope.series);
            angular.forEach($scope.series.comics, function(matchedComic){
                if(matchedComic.id == $scope.targetId){
                    console.log(matchedComic);
                    $scope.comicUpdate.comic_id = matchedComic.id;
                    $scope.comicUpdate.issueNumber = matchedComic.comic_issue
                    $scope.comicUpdate.comicWriter = matchedComic.comic_writer
                }
            });
        };

        $scope.openDeleteModal = function () {
            console.log($scope.targetId);
            ngDialog.open({
                template: './views/partials/deleteModal.html',
                scope: $scope,
                data: {
                    type: 'comic'
                }
            });
        };


        $scope.editThis = function(comicObject){
            console.log(comicObject);
            Comic.update({
                id: comicObject.comic_id,
                issue: comicObject.issueNumber,
                writer: comicObject.comicWriter
            }, function(){
                console.log('edited');
                angular.forEach($scope.series.comics, function(matchedComic){
                    if(matchedComic.id == comicObject.comic_id){
                        matchedComic.comic_issue = comicObject.issueNumber;
                        matchedComic.comic_writer = comicObject.comicWriter;
                    }
                });

            });
        };

        $scope.deleteThis = function (comicId) {
            Comic.delete({id: comicId}, function () {
                console.log('Comic ' + comicId + ' deleted.');
                angular.element('#comic_' + comicId).fadeOut(function () {
                    this.remove();
                });
            });
        };

        $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                var filename = file.name;

                var comicID = comicFunctions.genID();

                console.log(comicID);

                var exists = true;
                var html = "<div class='comicRow'><div data-comic-card data-image-url=\"'http://placehold.it\/185x287'\" class='comicContainer'  data-information=\"'#1'\"></div></div>";
                angular.element($compile(html)($scope)).hide().prependTo('#series').fadeIn();
                console.log('new and added at the end');


                var match_data = {
                    'exists': exists,
                    'series_id': $scope.series.id,
                    'comic_id': comicID,
                    'comic_issue': '1'
                };


                $scope.upload = $upload.upload({
                    url: env_var.urlBase + "/upload",
                    file: file,
                    data: {
                        'match_data': match_data
                    }
                }).progress(function (evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    console.log(data);
                });

            }
        };
    }
);
