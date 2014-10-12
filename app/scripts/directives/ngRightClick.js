/**
 * Created by Michael on 29/09/2014.
 */
comiccloudapp.directive('ngRightClick', function($document, $parse) {
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
                console.log(scope.$parent.targetId);
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
});