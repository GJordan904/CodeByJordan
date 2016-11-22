(function () {'use strict';

angular.module('planetoid.collisions', [])

.factory('Collisions', function() {
    return {
        bulletHitPlayer: function(player, bullet) {
            bullet.kill();
            playerDamaged(1, this);
        }
    }
})

}());
