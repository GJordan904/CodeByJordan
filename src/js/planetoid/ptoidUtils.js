(function () {'use strict';
    
angular.module('planetoid.utils', [])
    
.factory('ptoidUtils', function () {
    return {
        centerGameObject: function(objects) {
            objects.forEach(function(object) {
                object.anchor.setTo(0.5);
            });
        },
        screenWrap: function(sprite, game) {
            if (sprite.x < 0) {
                sprite.x = game.width;
            }
            else if (sprite.x > game.width) {
                sprite.x = 0;
            }

            if (sprite.y < 0) {
                sprite.y = game.height;
            }
            else if (sprite.y > game.height) {
                sprite.y = 0;
            }
        },
        goToMenu: function(btn) {
            btn.game.state.start('Menu', true, false, btn.game);
        },
        scaleElements: function(elements, game) {
            if(game.width >= 1400) {
                angular.forEach(elements, function(val, key, obj){
                    val.scale.setTo(1, 1);
                });
            }else if(game.width < 1400 && game.width >= 1000) {
                angular.forEach(elements, function(val, key, obj){
                    val.scale.setTo(.75, .75);
                });
            }else if(game.width < 1000) {
                angular.forEach(elements, function(val, key, obj){
                    val.scale.setTo(.5, .5);
                });
            }
        }
    }
})    
}());
