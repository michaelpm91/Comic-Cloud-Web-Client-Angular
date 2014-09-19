/**
 * Created by Michael on 16/09/2014.
 */
'use strict';

var comiccloudapp = angular.module('comicCloudClient', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
]);
comiccloudapp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/library', {
            templateUrl: './views/library.html',
            controller: 'LibraryController'
        })
        .when('/s/:id', {
            templateUrl: './views/series.html',
            controller: 'SeriesController'
        })
        .when('/c/:id', {
            templateUrl: './views/comic.html',
            controller: 'ComicController'
        })
        .when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/library'
        });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});
comiccloudapp.factory('dataFactory', ['$http', function ($http) {

    var urlBase = 'http://api.comiccloud.io/0.1';
    var comicEndPoint = urlBase + '/comic';
    var seriesEndPoint = urlBase + '/series';
    var dataFactory = {};

    $http.defaults.headers.common.Authorization = 'Basic ' + btoa('user1:1234');

    /*Comic Resource Request*/
    dataFactory.getComics = function () {
        return $http.get(comicEndPoint);
    };

    dataFactory.getComic = function (id) {
        return $http.get(comicEndPoint + "/" + id);
    };

    dataFactory.insertComic = function (comic) {
        return $http.post(comicEndPoint, comic);
    };

    dataFactory.updateComic = function (comic) {
        return $http.put(comicEndPoint + "/" + comic.id, comic)
    };

    dataFactory.deleteComic = function (id) {
        return $http.delete(comicEndPoint + "/" + id);
    };
    /*Comic Resource Request End*/

    /*Series Resource Request*/
    dataFactory.getAllSeries = function () {
        return $http.get(seriesEndPoint);
    };

    dataFactory.getSeries = function (id) {
        return $http.get(seriesEndPoint + "/" + id);
    };

    dataFactory.insertSeries = function (series) {
        return $http.post(seriesEndPoint, series);
    };

    dataFactory.updateSeries = function (series) {
        return $http.put(seriesEndPoint + "/" + seires.id, series)
    };

    dataFactory.deleteSeries = function (id) {
        return $http.delete(seriesEndPoint + "/" + id);
    };
    /*Series Resource Request End*/

    return dataFactory;
}]);