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
        $scope.currentUploads = uploadState.currentUploads;
        console.log($scope.uploadState);

        $scope.series;
        var series = Series.get({ id: $routeParams.id }, function () {
            $scope.series = series.series;
            console.log($scope.series);

            if (Object.keys($scope.currentUploads).length > 0) {
                if (Object.keys($scope.currentUploads[$scope.series.id]).length > 0) {
                    console.log($scope.currentUploads[$scope.series.id])
                    angular.forEach($scope.currentUploads[$scope.series.id]['comics'], function (uploadObject, comicID) {
                        $scope.series.comics.push({
                             id: comicID,
                             comic_collection: {},
                             comic_issue: uploadObject.matchData.comicIssue,
                             comic_status: "0",
                             comic_writer: "Unknown"
                         });
                    });
                }
            }
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


        $scope.selectedFiles = [];
        $scope.progress = [];
        $scope.upload = [];
        $scope.uploadResult = [];

        $scope.onFileSelect = function($files) {
            for ( var i = 0; i < $files.length; i++) {
                var newIndex = $scope.selectedFiles.push($files[i]) - 1;
                $scope.start(newIndex);
            }
        };


        $scope.start = function(index) {

            var file = $scope.selectedFiles[index];

            var filename = file.name;

            var comicMatchInformation = comicFunctions.getComicInformation(filename);
            var comicIssue = comicMatchInformation.comicIssue;

            var comicID = comicFunctions.genID();

            var exists = true;

            $scope.series.comics.push({
                id: comicID,
                comic_collection: {},
                comic_issue: comicMatchInformation.comicIssue,
                comic_status: "0",
                comic_writer: "Unknown"
            });

            if(!$scope.currentUploads.hasOwnProperty($scope.series.id)) {
                $scope.currentUploads[$scope.series.id] = {
                    progress : 0,
                    comics: {},
                    matchData: {
                        seriesTitle: $scope.series.series_title,
                        seriesStartYear: $scope.seriesseries_start_year
                    }
                };
            }
            $scope.currentUploads[$scope.series.id]['comics'][comicID] = {
                progress : 0,
                matchData: {
                    comicIssue: comicMatchInformation.comicIssue
                }
            };

            var match_data = {
                'exists': exists,
                'series_id': $scope.series.id,
                'comic_id': comicID,
                'comic_issue': comicMatchInformation.comicIssue
            };

            $scope.upload[index] = $upload.upload({
                url: env_var.urlBase + "/upload",
                file: $scope.selectedFiles[index],
                data: {
                    'match_data': match_data
                }
            }).progress(function(evt){
                $scope.currentUploads[$scope.series.id]['comics'][comicID]['progress'] = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                delete $scope.currentUploads[$scope.series.id]['comics'][comicID];
            });

        };
    }
);
