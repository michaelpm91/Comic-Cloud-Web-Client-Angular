'use strict';

angular.module('comicCloudClient')
	.controller('MainMenuController', ['$scope', 'menuState',
		function($scope, menuState){
			$scope.menuState = menuState;
			$scope.menuState.setState(false);
		}]);
