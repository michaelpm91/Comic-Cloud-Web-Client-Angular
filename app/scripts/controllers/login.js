/**
 * Created by Michael on 19/09/2014.
 */
'use strict';
//TODO: Refactor to be responsible for all authentication ie logout
angular.module('comicCloudClient')
    .controller('LoginController', function ($location, $cookies, $http, $scope, env_var, $rootScope) {
        $scope.submit = function(user){

            $rootScope.menu_show = false;

            var data = {
                'grant_type' : 'password',
                'client_id' : '1',
                'client_secret' : 'secret',
                'username' : user.email,
                'password' : user.password
            };

            $http({
                method  : 'POST',
                url     : env_var.apiBase + '/oauth/access_token',
                data    : $.param(data),
                headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            })
            .success(function(data) {
                $cookies.access_token = data.access_token;
                $cookies.refresh_token = data.refresh_token;
                $location.path("/library");
            });

        }
    }
);
