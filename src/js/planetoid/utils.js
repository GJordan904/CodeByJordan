
var utils = {
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
    }
};


