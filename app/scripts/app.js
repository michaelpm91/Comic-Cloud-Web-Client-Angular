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
    'ngTouch',
    'angularFileUpload',
    'ngDialog'
]);
comiccloudapp.config(function ($routeProvider, $locationProvider, $httpProvider) {
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

comiccloudapp.run(function($rootScope) {
    $rootScope.urlBase = 'http://dev.atomichael.com/Comic-Cloud-API/api/v1';
    //$rootScope.urlBase = 'http://api.comiccloud.io/0.1';
});
comiccloudapp.factory('Series', ['$resource', '$cookies', '$rootScope', function($resource, $cookies, $rootScope) {
    var urlBase = $rootScope.urlBase +'/series/:id';//'http://api.comiccloud.io/0.1/series/:id';
    return $resource(urlBase);
}]);
comiccloudapp.factory('Comic', ['$resource', '$cookies', '$rootScope', function($resource, $cookies, $rootScope) {
    var urlBase = $rootScope.urlBase + '/comic/:id';//'http://api.comiccloud.io/0.1/comic/:id';
    return $resource(urlBase);
}]);
comiccloudapp.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for(var i in input){
            out.push(input[i]);
        }
        return out;
    }
});
comiccloudapp.factory('comicFunctions', function () {
    return {
        genID: function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 40; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }
    }
});
comiccloudapp.directive('comicCard', function(){
    return {
        restrict: 'AE',
        scope: {
            imageUrl : '=imageUrl',
            url : '=url',
            information : '=information'
        },
        templateUrl: "./views/partials/comicCard.html"
    };
});
comiccloudapp.directive('mainMenu', function(){
    return {
        restrict: 'A',
        templateUrl: "./views/partials/mainMenu.html"
    };
});
comiccloudapp.factory('menuState', function(){
	var state = false;
	return{
		state: function() { return state; },
		setState: function(newState) { state = newState }
	};
});
comiccloudapp.factory('page', function() {
	var title = 'default';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
   };
});
comiccloudapp.directive('ngRightClick', ['$document', function($document, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var targetMenuElement = angular.element(
                document.getElementById('comicContextMenu')
            );

            var opened = false;
            function open(event, menuElement) {
                menuElement.addClass('open');
                scope.$parent.targetId = attrs.ngRightClick;
                //console.log(attrs);
                var doc = $document[0].documentElement;
                var docLeft = (window.pageXOffset || doc.scrollLeft) -
                        (doc.clientLeft || 0),
                    docTop = (window.pageYOffset || doc.scrollTop) -
                        (doc.clientTop || 0),
                    elementWidth = menuElement[0].scrollWidth,
                    elementHeight = menuElement[0].scrollHeight;
                var docWidth = doc.clientWidth + docLeft,
                    docHeight = doc.clientHeight + docTop,
                    totalWidth = elementWidth + event.pageX,
                    totalHeight = elementHeight + event.pageY,
                    left = Math.max(event.pageX - docLeft, 0),
                    top = Math.max(event.pageY - docTop, 0);

                if (totalWidth > docWidth) {
                    left = left - (totalWidth - docWidth);
                }

                if (totalHeight > docHeight) {
                    top = top - (totalHeight - docHeight);
                }

                menuElement.css('top', top + 'px');
                menuElement.css('left', left + 'px');
                opened = true;
            }
            function close(menuElement) {
                menuElement.removeClass('open');
                opened = false;
            }

            function handleKeyUpEvent(event) {
                if (opened ){ //&& event.keyCode === 27) {
                    scope.$apply(function () {
                        close(targetMenuElement);
                    });
                }
            }

            function handleClickEvent(event) {
                if (opened && event.button !== 2) {
                    scope.$apply(function () {
                        close(targetMenuElement);
                    });
                }
            }

            element.bind('contextmenu', function (event) {

                event.preventDefault();
                event.stopPropagation();

                scope.$apply(function () {
                    open(event, targetMenuElement);
                });
            });


            $document.bind('keyup', handleKeyUpEvent);
            // Firefox treats a right-click as a click and a contextmenu event
            // while other browsers just treat it as a contextmenu event
            $document.bind('click', handleClickEvent);
            $document.bind('contextmenu', handleClickEvent);

            scope.$on('$destroy', function () {
                //console.log('destroy');
                $document.unbind('keyup', handleKeyUpEvent);
                $document.unbind('click', handleClickEvent);
                $document.unbind('contextmenu', handleClickEvent);
            });
        }
    }
}]);
