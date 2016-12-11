(function () {'use strict';

angular.module('planetoid.bonuses', [])

.factory('HealthBonus', function(ptoidUtils){
    var HealthBonus = function(index, game, player){
        var x = game.world.randomX,
            y = game.world.randomY;
        this.game = game;
        this.player = player;
        this.alive = true;

        this.sprite = game.add.sprite(x, y, 'healthBonus');
        this.sprite.scale.setTo(.5, .5);
        this.sprite.type = 'healthBonus';
        this.sprite.name = index.toString();
        this.sprite.angle = game.rnd.angle();
        ptoidUtils.centerGameObject([this.sprite]);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        game.physics.arcade.velocityFromRotation(this.sprite.rotation, 100, this.sprite.body.velocity);
        this.sprite.body.immovable = false;
        this.sprite.body.bounce.setTo(1, 1);
    };

    HealthBonus.prototype.update = function() {
        this.sprite.rotation = this.game.physics.arcade.angleBetween(this.sprite, this.player);
        ptoidUtils.screenWrap(this.sprite, this.game);
    };

    HealthBonus.prototype.giveBonus = function () {
        this.sprite.kill();
        this.alive = false;
        this.player.health = 8;
        this.player.hearts.frame = 8;
    };

    return HealthBonus;
})
}());
