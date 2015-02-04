/**
 * Created by Michael on 17/09/2014.
 */

angular.module('comicCloudClient')
    .controller('ComicController',
        function ($cookies, $http, $location, $scope, $routeParams, Comic, env_var) {
            if(!$cookies.access_token){
                $location.path('/login');
            }
            $http.defaults.headers.common.Authorization = $cookies.access_token;
            $scope.cookies = $cookies;
            $scope.env_var = env_var;
            $scope.comic;
            $scope.comicLength;
            //$scope.currentComic = {};
            $scope.currentComic = [];
            $scope.currentPage = 1;

            var page = 1;

            $scope.currentlyLoaded = 0;
            $scope.loadTarget = 0;
            $scope.readerStatus = 'loading';
            var initialLoad = 6;

            var comic = Comic.get({ id: $routeParams.id }, function() {
                $scope.comic = comic.comic;
                $scope.comicLength = Object.keys($scope.comic.comic_collection).length;
                if ($scope.comicLength <= initialLoad) {
                    //$scope.currentComic = $scope.comic.comic_collection;
                    $scope.loadPages();
                } else {
                    $scope.loadPages(1, initialLoad);
                }

            });
            $scope.loadPages = function(start, end){
                console.log('loading pages from: ' + start + ' to: ' + end);
                $scope.readerStatus = 'loading-more';

                for (var i = start; i <= end; i++) {
                    //$scope.currentComic[i] = $scope.comic.comic_collection[i];
                    if(i < $scope.comicLength) {
                        $scope.currentComic.push($scope.comic.comic_collection[i]);
                        $scope.loadTarget = end;
                        if (!$scope.$$phase) $scope.$apply(); //TODO: This is pretty hacky. Please fix.
                    }
                }
                /*console.log(angular.element('#comicReader img.comicImg').length);
                setTimeout(function(){console.log(angular.element('#comicReader img.comicImg').length);}, 3000);
                //if(start == '' &&  end == ''){
                    //$scope.currentComic = $scope.comic.comic_collection;
                    angular.element('#comicReader img.comicImg').each(function(index){
                        console.log('empty?');
                        console.log(index + ': ' + angular.element(this).attr('lazy-src'));
                    });
                    $scope.loadTarget = $scope.comicLength;*/
               /* }else if(end == ''){

                }else{
                    for (var i = start; i <= end; i++) {
                        //console.log('loop @ ' + i + ' to: ' + end);
                        //$scope.currentComic[i] = $scope.comic.comic_collection[String(i)];
                        //$scope.currentComic.push($scope.comic.comic_collection[i]);
                        //$scope.loadTarget = end;
                        //if(!$scope.$$phase) $scope.$apply(); //TODO: This is pretty hacky. Please fix.
                        //$('#comicReader img').first().attr('src' , $('#comicReader img').first().attr('lazy-src'));
                        //angular.element("#comicReader .comicImg:nth-child(" + i + ")").addClass('active');
                    }
                }*/

                //if(int == true) angular.element("#comicReader img").first().removeClass('imgHide');

            };

            $scope.changePage = function (value) {
                if($scope.readerStatus == 'loading'){

                }else{

                    page += value;
                    page = Math.min(Math.max(page, 1), $scope.comicLength);
                    angular.element("#comicReader .comicImg").removeClass('active');
                    angular.element("#comicReader .comicImg:nth-child(" + page + ")").addClass('active');

                    if((page + 2) == $scope.currentlyLoaded && $scope.readerStatus != 'loading-more'){
                        $scope.loadPages($scope.currentlyLoaded + 1, $scope.currentlyLoaded + 1 + initialLoad);
                    }
                }
            };

            $scope.incrementCurrentlyLoadedCount = function(){
                $scope.currentlyLoaded++;
                if($scope.currentlyLoaded == $scope.loadTarget){
                    console.log('Reader Status: ready');
                    $scope.readerStatus = 'ready';
                    angular.element(".loadingScreen").fadeOut();//TODO: Move to directive.
                }
            }

            /*if($scope.currentlyLoaded == 6){
                angular.element("#comicReader img").first().removeClass('imgHide');
                console.log('ready');
            }*/

            /*$scope.$watch('currentlyLoaded', function() {

                console.log('change');
            });

            $scope.$watch('currentPage', function() {

                console.log('change');
            });*/

            var handler = function(e){
                if(e.keyCode === 37) {//Left
                    $scope.changePage(-1);
                }
                if(e.keyCode === 39) {//Right
                    $scope.changePage(1);
                }
                if(e.keyCode === 83) {//S - For Status
                    //console.log($scope.currentPage);
                    //console.log($scope.readerStatus);
                    console.log('Currently Loaded: ' + $scope.currentlyLoaded);
                    console.log('Page No: ' +page);
                    console.log($scope.currentComic);
                }
            };

            var $doc = angular.element(document);

            $doc.on('keydown', handler);

            $scope.$on('$destroy',function(){
                $doc.off('keydown', handler);
            });

        }
);