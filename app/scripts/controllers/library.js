/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LibraryController', ['$cookies','$http', '$location','$scope', '$rootScope', '$upload', 'Series', 'comicFunctions',
        function ($cookies, $http, $location, $scope, $rootScope, $upload, Series, comicFunctions) {
            if(!$cookies.access_token){
                return $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.series;
            var series = Series.get(function(){
                $scope.series = series.series;
            });

            $scope.menu = function(){
                console.log('right click');
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
                    angular.forEach(angular.element('.comicBlock'), function(ele){
                        var existingSeries = angular.element(ele).data('series-title');
                        if(continueLoop) {
                            if (seriesTitle.toUpperCase() == existingSeries.toUpperCase()) {
                                exists = true;
                                //angular.element(ele).after("<div class='comicBlock'><div class='comicBlockInformation'></div></div>");
                                console.log('exists');
                                seriesID = angular.element(ele).data('series-id');
                                return continueLoop = false;
                            }
                            if (seriesTitle.toUpperCase() < existingSeries.toUpperCase()) {
                                //$(item).parent('a').before("<a title='" + seriesTitle + "' data-series-name='" + matchName + "' data-series-id='" + series_id + "'><div class='comicCard'><img src='http://placehold.it/185x287'><progress id='" + series_id + "' value='0' max='100'></progress><p>" + matchName + " (" + startYear + ")</p></div></a>");
                                angular.element(ele).before("<div class='comicBlock'><img src='http://placehold.it/185x287'/><div class='comicBlockInformation'>" + seriesTitle + " (0000)</div></div>");
                                added = true;
                                console.log('new and added before ' + existingSeries);
                                return continueLoop = false;
                            }
                        }
                    });
                    if(!added && !exists){
                        angular.element('#library').append("<div class='comicBlock'><img src='http://placehold.it/230x350'/><div class='comicBlockInformation'>" + seriesTitle + " (0000)</div></div>");
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
