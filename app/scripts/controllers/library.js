/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LibraryController', function ($cookies, $http, $location, $scope, $rootScope, $upload, $document, $compile, $timeout, $interval, Series, Comic, comicFunctions, env_var, uploadState) {
        /*if (!$cookies.access_token) {
            return $location.path('/login');
        }*/

        $rootScope.menu_show = true;

        $http.defaults.headers.common.Authorization = $cookies.access_token;
        $scope.cookies = $cookies;
        $scope.env_var = env_var;
        $scope.targetId;
        $scope.series;
        $scope.panelVisibility = true;

        $scope.uploadState = uploadState;
        $scope.currentUploads = uploadState.currentUploads;
        console.log($scope.uploadState);

        $scope.processingComic = [];
        $scope.seriesUpdate = {};
        //$scope.currentUploads = {};

        $scope.currentSelections = [];

        var series = Series.get(function () {
            $scope.series = series.series;
            //console.log($scope.series);
            if (Object.keys($scope.currentUploads).length > 0) {
                angular.forEach($scope.currentUploads, function (uploadObject, seriesID) {
                    var tempExist = true;
                    angular.forEach($scope.series, function(seriesObject, seriesIDKey){
                        //if(seriesIDKey == seriesID) tempExist = false;
                        if(seriesObject.id  == seriesID) tempExist = false;
                        console.log(seriesObject.id + ' == ' + seriesID);
                    });
                    if(tempExist){
                        console.log('Rebuilding a series! :) ');
                        $scope.series.push({
                            id: seriesID,
                            series_publisher: "Unknown",
                            series_start_year: uploadObject.matchData.seriesStartYear,
                            series_title: uploadObject.matchData.seriesTitle
                        });
                    }else{
                        console.log('nothing to rebuild here :( ');
                    }
                });
            }
            angular.forEach($scope.series, function(seriesObject, seriesIDKey) {
                angular.forEach(seriesObject['comics'], function(comicObject, comicId){
                    //console.log(comicObject);
                    if(comicObject['comic_status'] == 0){
                        $scope.processingComic.push({comic_id: comicObject['id']})
                    }
                });
            });
            //console.log($scope.series);
        });



        $scope.addSeries = function(){
            //$scope.series.push({series_title: "Fantastic Thing!"});
            //console.log($scope.series);
            //angular.grep($scope.series, function (series) { return series.series_title == "Fantastic Four" });
            //var currentSeries = $scope.series.filter(function (series) { return series.series_title == "Fantastic Four"  });
            //console.log(currentSeries);
            //$scope.uploadState.push('stuff');
            console.log($scope.uploadState);

        };

        $scope.openEditModal = function () {
            $scope.panelVisibility = false;
            $scope.targetId;
            angular.forEach($scope.series, function(matchedSeries){
                if(matchedSeries.id == $scope.targetId){
                    $scope.seriesUpdate.series_id = matchedSeries.id;
                    $scope.seriesUpdate.title = matchedSeries.series_title;
                    $scope.seriesUpdate.startYear = matchedSeries.series_start_year;
                    $scope.seriesUpdate.publisher = matchedSeries.series_publisher;
                }
            });
        };
        $scope.closeEditModal = function(){
            console.log('firing');
            $scope.panelVisibility = true;
        };

        /*$scope.openDeleteModal = function () {
            console.log($scope.targetSeries);
            ngDialog.open({
                template: './views/partials/deleteModal.html',
                scope: $scope,
                data: {
                    type: 'series'
                }
            });
        };*/

        $scope.editThis = function(seriesObject){
            console.log(seriesObject);
            Series.update({
                id: seriesObject.series_id,
                title: seriesObject.title,
                start_year: seriesObject.startYear,
                publisher: seriesObject.publisher
            }, function(){
                console.log('edited');
                angular.forEach($scope.series, function(matchedSeries){
                    if(matchedSeries.id == seriesObject.series_id){
                        matchedSeries.series_title = seriesObject.title;
                        matchedSeries.series_start_year = seriesObject.startYear;
                        matchedSeries.series_publisher = seriesObject.publisher;
                    }
                });
            });
        };

        $scope.deleteThis = function (seriesId) {
            Series.delete({id: seriesId}, function () {
                console.log('Series ' + seriesId + ' deleted.');
                angular.element('#series_' + seriesId).fadeOut(function () {
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
            console.log('uplaod start');

            var file = $scope.selectedFiles[index];

            var filename = file.name;

            var comicMatchInformation = comicFunctions.getComicInformation(filename);
            var seriesTitle = comicMatchInformation.seriesTitle;
            var seriesStartYear = comicMatchInformation.seriesStartYear;
            var comicIssue = comicMatchInformation.comicIssue;

            var seriesID = comicFunctions.genID();
            var comicID = comicFunctions.genID();

            var exists = false;

            var currentSeries = $scope.series.filter(function (series) { return series.series_title.toUpperCase() == seriesTitle.toUpperCase()  });
            var lengthOfCurrentSeries = Object.keys(currentSeries).length;
            if(!lengthOfCurrentSeries){
                $scope.series.push({
                    id: seriesID,
                    series_publisher: "Unknown",
                    series_start_year: seriesStartYear,
                    series_title: seriesTitle
                    //series_upload_progress: 0
                });
                $scope.currentUploads[seriesID] = {
                    progress : 0,
                    comics: {},
                    matchData: {
                        seriesTitle: seriesTitle,
                        seriesStartYear: seriesStartYear
                    }
                };
                $scope.currentUploads[seriesID]['comics'][comicID] = {
                    progress : 0,
                    matchData: {
                        comicIssue: comicMatchInformation.comicIssue
                    }
                };
            }else{
                exists = true;
                seriesID = currentSeries[0]['id'];
                if(!$scope.currentUploads.hasOwnProperty(seriesID)) $scope.currentUploads[seriesID] = {};
                if(!$scope.currentUploads[seriesID].hasOwnProperty('comics')) $scope.currentUploads[seriesID] = {comics : {}};
                if(Object.keys($scope.currentUploads[seriesID]['comics']).length == 0){
                    $scope.currentUploads[seriesID] = {progress : 0, comics: {} };
                }
                $scope.currentUploads[seriesID]['comics'][comicID] = {
                    progress : 0,
                    matchData: {
                        comicIssue: comicMatchInformation.comicIssue
                    }
                };
            }


            var match_data = {
                'exists': exists,
                'series_id': seriesID,
                'comic_id': comicID,
                'series_title': seriesTitle,
                'series_start_year': seriesStartYear,
                'comic_issue': comicIssue
            };

            $scope.upload[index] = $upload.upload({
                url: env_var.apiBase + "/upload",
                file: $scope.selectedFiles[index],
                data: {
                    'match_data': match_data
                }
            }).progress(function(evt){
                $scope.currentUploads[seriesID]['comics'][comicID]['progress'] = parseInt(100.0 * evt.loaded / evt.total);

            }).success(function(data, status, headers, config) {
                delete $scope.currentUploads[seriesID]['comics'][comicID];
				var comicProcessTimer = $interval(function(){
					console.log('Process Check.');
					//var updatedSeries = Series.get({ id: $routeParams.id }, function () {
						//$scope.series = series.series;
						//console.log($scope.series);
					//});
					var updatedComic = Comic.get({ id: comicID}, function() {
						console.log(updatedComic.comic);
						if(updatedComic.comic.comic_status == 1){
							$interval.cancel(comicProcessTimer);
							console.log('Processing Finished.');	
						}
					});

				}, 5000);
            });
        };

        $scope.highlight = function($event, seriesid) {
            if($event.shiftKey){
                $event.preventDefault();
                //console.log('shift click');
                console.log(seriesid);
                $scope.currentSelections.push(seriesid);
                console.log($scope.currentSelections);
            }
        };

        $scope.clearSelection = function($event){
            if($event.target.id == 'library') {
                $scope.currentSelections = [];
                console.log('clear');
            }
        };
    }
);
