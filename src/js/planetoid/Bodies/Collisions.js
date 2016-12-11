(function () {'use strict';

angular.module('planetoid.collisions', [])

.factory('Collisions', function($timeout, ptoidUtils) {
    var Collisions = function() {};

    Collisions.prototype.bulletHitPlayer = function(player, bullet) {
        bullet.kill();
        playerDamaged(1, this);
    };

    Collisions.prototype.bulletHitEnemy = function(ship, bullet) {
        bullet.kill();
        var destroyed = this.enemies[ship.name].damage();

        if (destroyed) {
            explode(ship, this);
            this.Score.scoredPoint('ship', ship);
            this.enemiesDead++;
        }
    };

    Collisions.prototype.bulletHitPtoid = function(ptoid, bullet) {
        bullet.kill();
        switch(bullet.key) {
            case 'laserRed':
                switch(ptoid.type) {
                    case 'ptoidLg':
                        this.ptoidTotal--;
                        this.ptoidsLg[ptoid.name].lgDamage();
                        break;
                    case 'ptoidMd':
                        this.ptoidsMd[ptoid.name].mdDamage();
                        break;
                    case 'ptoidSm':
                        this.ptoidsSm[ptoid.name].damage();
                        break;
                }
                this.Score.scoredPoint(ptoid.type, ptoid);
                break;
        }
    };

    Collisions.prototype.bulletHitBonus = function(bonus, bullet) {
        bullet.kill();
        switch(bonus.type) {
            case 'healthBonus':
                this.bonuses[bonus.name].giveBonus();
                break;
        }
    };

    Collisions.prototype.collided = function(player, sprite) {
        switch(sprite.type) {
            case 'ptoidLg':
                this.ptoidTotal--;
                this.ptoidsLg[sprite.name].lgDamage();
                playerDamaged(10, this);
                break;
            case 'ptoidMd':
                this.ptoidsMd[sprite.name].mdDamage();
                playerDamaged(4, this);
                break;
            case 'ptoidSm':
                this.ptoidsSm[sprite.name].damage();
                playerDamaged(2, this);
                break;
            case 'shipSm':
                this.enemies[sprite.name].damage();
                playerDamaged(1, this);
                break;
            case 'healthBonus':
                this.bonuses[sprite.name].giveBonus();
                break;
        }
    };

    function playerDamaged(amount, context) {
        var destroyed = context.player.damage(amount);
        if(destroyed) {
            context.pBullets.forEachAlive(function(bullet){bullet.kill()}, context);
            context.eBullets.forEachAlive(function(bullet){bullet.kill()}, context);
            explode(context.player.sprite, context);
            // Update score in service
            ptoidUtils.score = context.Score.getScore();
            // Trigger Kill Player
            context.player.kill(context.Score.getScore(), context.level);
            //Blow everything up, wait for player to blowup first
            $timeout(function() {
                context.enemies.forEach(function(enemy){if(enemy.alive) explode(enemy.sprite, context)});
                context.ptoidsLg.forEach(function(ptoid){if(ptoid.alive)explode(ptoid.sprite, context)});
                context.ptoidsMd.forEach(function(ptoid){if(ptoid.alive)explode(ptoid.sprite, context)});
                context.ptoidsSm.forEach(function(ptoid){if(ptoid.alive)explode(ptoid.sprite, context)});
            }.bind(null, context), 2000);
        }
    }

    function explode(sprite, context) {
        sprite.kill();
        var explosion =  context.explosions.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('explosion', 30, false, true);
    }

    return Collisions;
});

}());
