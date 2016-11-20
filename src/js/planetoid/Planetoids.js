(function () {'use strict';

angular.module('planetoid.planetoids', [])

.factory('PlanetoidLarge', function() {

    var PlanetoidLarge = function(game) {
        this.game = game;
    };

    return PlanetoidLarge;
})

}());
