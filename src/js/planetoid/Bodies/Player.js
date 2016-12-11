(function () {'use strict';

angular.module('planetoid.player', [])

.factory('Player', function($timeout, ptoidUtils, leaderFact) {

    var Player = function(game, bullets, explosions) {
        this.game = game;
        this.bullets = bullets;
        this.explosions = explosions;

        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        this.sprite.angle += -90;
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.drag.set(100);
        this.sprite.body.maxVelocity.set(200);
        this.sprite.body.immovable = false;

        this.health = 8;
        this.hearts = game.add.sprite(0, 0, 'health', this.health);
        ptoidUtils.scaleElements([this.hearts], game);
        this.hearts.x = game.width - (this.hearts.width/2);
        this.hearts.y = this.hearts.height/2;

        this.bulletTime = 0;
        ptoidUtils.centerGameObject([this.sprite, this.hearts]);
    };

    Player.prototype.damage = function(amount) {
        this.health -= amount;
        this.hearts.frame = this.health;

        return this.health <= 0;

    };

    Player.prototype.fireLaser = function() {
        if(this.game.time.now > this.bulletTime){
            var bullet = this.bullets.getFirstExists(false);

            if(bullet) {
                bullet.reset(this.sprite.body.x + 26, this.sprite.body.y + 26);
                bullet.lifespan = 2000;
                bullet.rotation = this.sprite.rotation;
                this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, bullet.body.velocity);
                this.bulletTime = this.game.time.now + 100;
            }
        }
    };

    Player.prototype.kill = function(score, level) {
        var self = this;
        this.hearts.frame = 0;
        leaderFact.saveScore(score, level);
        $timeout(function(){self.game.state.start('Lost', true, false, self.game ,score, level);}, 3500);
    };

    return Player;
})

}());
