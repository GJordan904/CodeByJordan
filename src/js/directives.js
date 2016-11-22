(function () {'use strict';

angular.module('app.directives', [])

.directive('menu', function($window, $animate, $document) {
   return {
       restrict: 'E',
       templateUrl: 'views/partials/menu.html',
       link: function(scope, elem, attrs) {
           // Child Elements
           var text = elem.find('.menu-text'),
               button = elem.find('button'),
               menu = elem.find('#menu');

           // Hide Menu so animation doesn't activate on start
           menu.css({display: 'none'});

           // / Toggle On Click
           scope.isCollapsed = true;
           scope.toggle = function() {
               if(scope.isCollapsed) menu.css({display: 'block'}).addClass('menu').removeClass('menuHidden');
               else menu.addClass('menuHidden').removeClass('menu');
               scope.isCollapsed = !scope.isCollapsed;
           };

           // Change Menu Button On Scroll
            angular.element($window)
                .on('scroll', function () {
                    if(this.pageYOffset >= 50) {
                        text.removeClass('fadeIn').addClass('fadeOut');
                        $animate.setClass(button, 'menu-button-round', 'menu-button', {
                            from: {opacity: 0},
                            to: {opacity: 1}
                        });
                        scope.$apply();
                    } else {
                        if(scope.isCollapsed)text.removeClass('fadeOut').addClass('fadeIn');
                        $animate.removeClass(button, 'menu-button-round');
                        $animate.addClass(button, 'menu-button', {
                            from: {opacity: 0},
                            to: {opacity: 1}
                        });
                        scope.$apply();
                    }
                });

           // On nav click scroll to anchor
           scope.scrollToElem = function(id) {
               var elem = angular.element(document.getElementById(id));
               scope.toggle();
               $document.duScrollToElement(elem, 0, 2000)
           };
       }
   }
})

.directive('navDown', function($document) {
    return{
        restrict: 'A',
        link: function(scope, elem, attrs) {
            var el = angular.element(document.getElementById(attrs.navDown));

            elem.on('click', function() {
                $document.duScrollToElement(el, 0, 1500);
                console.log("el: " + el + " attrs.value: " + attrs.navDown);
            });
        }
    }
})

.directive('game', function(BootState, $window) {
    return {
        restrict: 'E',
        template: '<div id="game-canvas" class="col-9 no-padding"></div>',
        link: function(scope, elem, attrs) {
            var container = elem.find('#game-canvas'),
                window = angular.element($window);

            var height  = parseInt(container.css('height'), 10),
                width   = parseInt(container.css('width'), 10);

            var game = new Phaser.Game(width, height, Phaser.AUTO, 'game-canvas');
            var canvas = container.find('canvas');
            console.log(canvas);

            window.bind('resize', function() {
                console.log("Container width: " + container.width());
                canvas.css('height', container.height(), 'width', container.width());
            });

            game.state.add('Boot', new BootState());
            game.state.start('Boot', true, false, game);
        }
    }
});
}());