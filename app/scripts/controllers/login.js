/**
 * Created by Michael on 19/09/2014.
 */
'use strict';

angular.module('comicCloudClient')
    .controller('LoginController', ['$location', '$cookies','$http','$scope', 'dataFactory',
        function ($location, $cookies, $http, $scope, dataFactory) {
			$scope.submit = function(user){
				//var data = ['grant_type' => 'password', 'client_id' => '1', 'client_secret' => 'secret'];
				//user.push.apply(user, data);
                var param = function(obj) {
                    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

                    for(name in obj) {
                        value = obj[name];

                        if(value instanceof Array) {
                            for(i=0; i<value.length; ++i) {
                                subValue = value[i];
                                fullSubName = name + '[' + i + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if(value instanceof Object) {
                            for(subName in value) {
                                subValue = value[subName];
                                fullSubName = name + '[' + subName + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if(value !== undefined && value !== null)
                            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }

                    return query.length ? query.substr(0, query.length - 1) : query;
                };

                // Override $http service's default transformRequest
                $http.defaults.transformRequest = [function(data) {
                    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
                }];
                var data = {
                    'grant_type' : 'password',
                    'client_id' : 'defo',
                    'client_secret' : 'mega_secret',
                    'username' : user.email,
                    'password' : user.password
                };
                console.log(data.client_secret);
				$http({
					method  : 'POST',
					url     : 'http://dev.atomichael.com/Comic-Cloud-API/oauth/access_token',
					data    : data,
					headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
				})
				.success(function(data) {
					//console.log(data);
                    $cookies.access_token = data.access_token;
                    $cookies.refresh_token = data.refresh_token;
                    $location.path("/library");
				});
				//var data = {'grant_type':'password', 'client_id':'1', 'client_secret':'secret'};
        		//return $http.post('http://dev.atomichael.com/Comic-Cloud-API/oauth/access_token', data);
			}
        }
    ]
);
