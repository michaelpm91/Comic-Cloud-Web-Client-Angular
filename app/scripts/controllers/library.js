/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LibraryController', ['$cookies','$http', '$location','$scope', '$rootScope', '$upload', '$document', '$compile', 'ngDialog', 'Series', 'comicFunctions',
        function ($cookies, $http, $location, $scope, $rootScope, $upload, $document, $compile, ngDialog, Series, comicFunctions) {
            if(!$cookies.access_token){
                return $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.targetId;
            $scope.series;
            $scope.currentUploads = {};
            var series = Series.get(function(){
                $scope.series = series.series;
            });
            $scope.test = function () {
                console.log('yo');
            }
            $scope.openEditModal = function(){
                ngDialog.open({
                    template: './views/directives/editModal.html',
                    scope: $scope
                });
            }

            $scope.openDeleteModal = function () {
                console.log($scope.targetSeries);
                ngDialog.open({
                    template: './views/directives/deleteModal.html',
                    scope: $scope,
                    data : {
                        type : 'series'
                    }
                });
            };
            $scope.deleteThis = function(seriesId) {
                Series.delete({id:seriesId}, function(){
                    console.log('Series ' + seriesId + ' deleted.');
                    angular.element('#series_' + seriesId).fadeOut(function(){
                        this.remove();
                    });
                });
            }

            $scope.onFileSelect = function($files) {
                for (var i = 0; i < $files.length; i++) {
                    var file = $files[i];

                    var filename = file.name;

                    var seriesTitle = filename.replace(/ Vol.[0-9]+| #[0-9]+|\(.*?\)|\.[a-z0-9A-Z]+$/g, "").trim();
                    console.log(seriesTitle);

                    var seriesID = comicFunctions.genID();

                    var added = false;
                    var exists = false;
                    var continueLoop = true;
                    angular.forEach(angular.element('.comicContainer'), function(ele){
                        var existingSeries = angular.element(ele).data('series-title');
                        if(continueLoop) {
                            if (seriesTitle.toUpperCase() == existingSeries.toUpperCase()) {
                                exists = true;
                                console.log('exists');
                                seriesID = angular.element(ele).data('series-id');
                                return continueLoop = false;
                            }
                            if (seriesTitle.toUpperCase() < existingSeries.toUpperCase()) {
                                var html = "<div class='comicRow'><div data-comic-card data-image-url=\"'http://placehold.it\/185x287'\" class='comicContainer' data-series-id='" + seriesID + "' data-series-title='" + seriesTitle + "' data-information=\"'" + seriesTitle + " (0000)'\"></div></div>";
                                angular.element(ele).parent().before($compile(angular.element(html).hide().fadeIn().css("display","inline-block"))($scope));
                                added = true;
                                console.log('new and added before ' + existingSeries);
                                return continueLoop = false;
                            }
                        }
                    });
                    if(!added && !exists){
                        var html = "<div class='comicRow'><div data-comic-card data-image-url=\"'http://placehold.it\/185x287'\" class='comicContainer' data-series-id='" + seriesID + "' data-series-title='" + seriesTitle + "' data-information=\"'" + seriesTitle + " (0000)'\"></div></div>";
                        angular.element($compile(html)($scope)).hide().appendTo('#library').fadeIn();
                        console.log('new and added at the end');
                    }

                    var match_data = {
                        'exists' : exists,
                        'series_id' : seriesID,
                        'series_title' : seriesTitle,
                        'series_start_year' : '0000',
                        'comic_issue' : '1'
                    };



                    $scope.upload = $upload.upload({
                        url: 'http://dev.atomichael.com/Comic-Cloud-API/api/v1/upload',//'http://api.comiccloud.io/0.1/upload',
                        file: file,
                        data: {
                            'match_data' : match_data
                        }
                    }).progress(function(evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    }).success(function(data, status, headers, config) {
                        console.log(data);
                    });

                }
            }

        }
    ]
);
