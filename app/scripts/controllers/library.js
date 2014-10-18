/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LibraryController', function ($cookies, $http, $location, $scope, $rootScope, $upload, $document, $compile, $timeout, ngDialog, Series, comicFunctions, menuState, env_var, uploadState) {
        if (!$cookies.access_token) {
            return $location.path('/login');
        }

        /*$scope.showMenuIcon = function(){
         return true;
         }*/
        menuState.setState(true);

        $http.defaults.headers.common.Authorization = $cookies.access_token;
        $scope.cookies = $cookies;
        $scope.env_var = env_var;
        $scope.targetId;
        $scope.series;
        $scope.panelVisibility = true;

        $scope.uploadState = uploadState;
        $scope.currentUploads = uploadState.currentUploads;
        console.log($scope.uploadState);


        $scope.seriesUpdate = {};
        //$scope.currentUploads = {};

        $scope.currentSelections = [];

        var series = Series.get(function () {
            $scope.series = series.series;
            console.log($scope.series);
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

        $scope.openDeleteModal = function () {
            console.log($scope.targetSeries);
            ngDialog.open({
                template: './views/partials/deleteModal.html',
                scope: $scope,
                data: {
                    type: 'series'
                }
            });
        };

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

            var file = $scope.selectedFiles[index];

            var filename = file.name;

            var seriesTitle = filename.replace(/ Vol.[0-9]+| #[0-9]+|\(.*?\)|\.[a-z0-9A-Z]+$/g, "").trim();


            var seriesID = comicFunctions.genID();
            var comicID = comicFunctions.genID();

            var exists = false;

            var currentSeries = $scope.series.filter(function (series) { return series.series_title.toUpperCase() == seriesTitle.toUpperCase()  });
            var lengthOfCurrentSeries = Object.keys(currentSeries).length;
            if(!lengthOfCurrentSeries){
                $scope.series.push({
                    id: seriesID,
                    series_publisher: "Unknown",
                    series_start_year: "0000",
                    series_title: seriesTitle,
                    series_upload_progress: 0
                });
                $scope.currentUploads[seriesID] = { progress : 0, comics: {}};
                $scope.currentUploads[seriesID]['comics'][comicID] = {progress : 0};
            }else{
                exists = true;
                seriesID = currentSeries[0]['id'];

                if(!$scope.currentUploads.hasOwnProperty(seriesID)){
                    $scope.currentUploads[seriesID] = { progress : 0, comics: {}};
                }

                $scope.currentUploads[seriesID]['comics'][comicID] = {progress : 0};
            }
            //var currentSeries = $scope.series.filter(function (series) { return series.id == seriesID  });


            var match_data = {
                'exists': exists,
                'series_id': seriesID,
                'comic_id': comicID,
                'series_title': seriesTitle,
                'series_start_year': '0000',
                'comic_issue': '1'
            };

            $scope.progress[index] = 0;
            $scope.errorMsg = null;
            $scope.upload[index] = $upload.upload({
                url: env_var.urlBase, //+ "/upload",
                file: $scope.selectedFiles[index],
                data: {
                    'match_data': match_data
                }
            }).progress(function(evt){
                $scope.currentUploads[seriesID]['comics'][comicID]['progress'] = parseInt(100.0 * evt.loaded / evt.total);

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
