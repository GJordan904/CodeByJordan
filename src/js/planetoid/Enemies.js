
    'use strict';

angular.module('planetoid.enemies', [])

.factory('EnemySmall', function() {

    var EnemySmall = function(index, game, player, bullets) {
        var x = game.world.randomX;

        this.game = game;
        this.player = player;
        this.bullets = bullets;
        this.alive = true;
        this.nextFire = 0;

        this.health = 3;
        this.fireRate = 2000;

        this.sprite = game.add.sprite(x, 0, 'enemySm1');
        this.sprite.angle = game.rnd.angle();
        utils.centerGameObject([this.sprite]);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        game.physics.arcade.velocityFromRotation(this.sprite.rotation, 100, this.sprite.body.velocity);
        this.sprite.name = index.toString();
        this.sprite.type = 'shipSm';
        this.sprite.body.immovable = false;
        this.sprite.body.bounce.setTo(1, 1);

    };

    EnemySmall.prototype.damage = function() {
        this.health -= 1;

        if(this.health <= 0){
            this.alive = false;
            this.sprite.kill();
            return true;
        }
        return false;
    };

    EnemySmall.prototype.update = function() {
        this.sprite.rotation = this.game.physics.arcade.angleBetween(this.sprite, this.player);

        if(this.game.physics.arcade.distanceBetween(this.sprite, this.player) < 750) {
            if(this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet = this.bullets.getFirstDead();
                bullet.reset(this.sprite.x, this.sprite.y);
                bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
            }
        }
    };

    return EnemySmall;
})

.factory('EnemySmall2', function(EnemySmall) {

    var EnemySmall2 = function(index, game, player, bullets) {
        angular.extend(this, new EnemySmall(index, game, player, bullets));

    };

    EnemySmall2.prototype = new EnemySmall(this.index, this.game, this.player, this.bullets);

    return EnemySmall2;
});
