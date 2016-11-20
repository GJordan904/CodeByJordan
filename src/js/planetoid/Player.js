(function () {'use strict';

angular.module('planetoids.player', [])

.factory('Player', function() {

    var Player = function(game, bullets) {
        this.game = game;
        this.bullets = bullets;

        this.ship = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        this.ship.angle += -90;
        utils.centerGameObject([this.ship]);
        game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.body.drag.set(100);
        this.ship.body.maxVelocity.set(200);
        this.ship.body.immovable = false;

        this.health = 5;
        this.hearts = game.add.sprite(game.width-61, 0, 'health', this.health);

        this.bulletTime = 0;
    };

    Player.prototype.damage = function() {
        console.log(this.health);
        this.health -= 1;
        this.hearts.frame = this.health;

        if(this.health <= 0) {

        }
    };

    Player.prototype.fireLaser = function() {
        if(this.game.time.now > this.bulletTime){
            var bullet = this.bullets.getFirstExists(false);

            if(bullet) {
                bullet.reset(this.ship.body.x + 26, this.ship.body.y + 26);
                bullet.lifespan = 2000;
                bullet.rotation = this.ship.rotation;
                this.game.physics.arcade.velocityFromRotation(this.ship.rotation, 400, bullet.body.velocity);
                this.bulletTime = this.game.time.now + 100;
            }
        }
    };

    return Player;
})

}());
