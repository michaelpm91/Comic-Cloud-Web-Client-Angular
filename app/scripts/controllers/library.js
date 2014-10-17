/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LibraryController', function ($cookies, $http, $location, $scope, $rootScope, $upload, $document, $compile, ngDialog, Series, comicFunctions, menuState, env_var) {
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


        $scope.seriesUpdate = {};
        $scope.currentUploads = {};

        $scope.currentSelections = [];

        var series = Series.get(function () {
            $scope.series = series.series;
            //console.log($scope.series);
        });

        $scope.addSeries = function(){
            $scope.series.push({series_title: "Fantastic Thing!"});
            console.log($scope.series);
        };

        $scope.openEditModal = function () {
            $scope.panelVisibility = false;
            $scope.targetId;
            //console.log($scope.targetId);
            //console.log($scope.series.indexOf($scope.targetId));
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

        $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];

                var filename = file.name;

                var seriesTitle = filename.replace(/ Vol.[0-9]+| #[0-9]+|\(.*?\)|\.[a-z0-9A-Z]+$/g, "").trim();
                console.log(seriesTitle);

                var seriesID = comicFunctions.genID();
                var comicID = comicFunctions.genID();

                console.log(comicID);

                var added = false;
                var exists = false;
                var continueLoop = true;
                angular.forEach(angular.element('.comicContainer'), function (ele) {
                    var existingSeries = angular.element(ele).data('series-title');
                    if (continueLoop) {
                        if (seriesTitle.toUpperCase() == existingSeries.toUpperCase()) {
                            exists = true;
                            console.log('exists');
                            seriesID = angular.element(ele).data('series-id');
                            return continueLoop = false;
                        }
                        if (seriesTitle.toUpperCase() < existingSeries.toUpperCase()) {
                            var html = "<div class='comicRow'><div data-comic-card data-image-url=\"'http://placehold.it\/185x287'\" class='comicContainer' data-series-id='" + seriesID + "' data-series-title='" + seriesTitle + "' data-information=\"'" + seriesTitle + " (0000)'\"></div></div>";
                            angular.element(ele).parent().before($compile(angular.element(html).hide().fadeIn().css("display", "inline-block"))($scope));
                            added = true;
                            console.log('new and added before ' + existingSeries);
                            return continueLoop = false;
                        }
                    }
                });
                if (!added && !exists) {
                    var html = "<div class='comicRow'><div data-comic-card data-image-url=\"'http://placehold.it\/185x287'\" class='comicContainer' data-series-id='" + seriesID + "' data-series-title='" + seriesTitle + "' data-information=\"'" + seriesTitle + " (0000)'\"></div></div>";
                    angular.element($compile(html)($scope)).hide().appendTo('#library').fadeIn();
                    console.log('new and added at the end');
                }

                var match_data = {
                    'exists': exists,
                    'series_id': seriesID,
                    'comic_id': comicID,
                    'series_title': seriesTitle,
                    'series_start_year': '0000',
                    'comic_issue': '1'
                };
				if(!$scope.currentUploads[seriesID]) $scope.currentUploads[seriesID] = {};
				$scope.currentUploads[seriesID][comicID] = {'progress' : '0'};
                $scope.upload = $upload.upload({
                    url: env_var.urlBase + "/upload",//'http://dev.atomichael.com/Comic-Cloud-API/api/v1/upload',//'http://api.comiccloud.io/0.1/upload',
                    file: file,
                    data: {
                        'match_data': match_data
                    }
                }).progress(function (evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
					$scope.currentUploads[seriesID][comicID]['progress'] = parseInt(100.0 * evt.loaded / evt.total);
					//console.log($scope.currentUploads);
					//console.log($scope.progressAverage(seriesID));
                }).success(function (data, status, headers, config) {
                    console.log(data);
                });

            }
        };

		$scope.progressAverage = function(targetSeriesID) {
            console.log(targetSeriesID);
            console.log($scope.currentUploads);
            if (!$scope.currentUploads) {
                return 0;
            } else {
                var lengthOfUploads = Object.keys($scope.currentUploads[targetSeriesID]).length;
                var total = 0;
                if (lengthOfUploads == 0) return 0;
                angular.forEach($scope.currentUploads[targetSeriesID], function (value, key) {
                    total += value['progress'];
                    //console.log(value['progress']);
                });
                var finalTotal = total / (lengthOfUploads * 100) * 100;
                console.log('something');
                console.log(finalTotal);
                return 100;
                return finalTotal;
            }
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
            /*$event.stopPropagation();
            $event.cancelBubble = true;
            $event.returnValue = false;*/
            if($event.target.id == 'library') {
                $scope.currentSelections = [];
                console.log('clear');
            }
        };
    }
);
