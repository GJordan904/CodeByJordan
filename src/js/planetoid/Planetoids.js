(function () {'use strict';

angular.module('planetoid.planetoids', [])

.factory('Planetoid', function() {
    var Planetoid = function(game, player) {
        this.game = game;
        this.player = player;
        this.alive = true;
        this.spinTime = 0;
    };

    Planetoid.prototype.update = function() {
        this.sprite.rotation = this.game.physics.arcade.angleBetween(this.sprite, this.player);

        if(this.spinTime < this.game.time.now) {
            switch(this.sprite.frame) {
                case 15:
                    this.sprite.frame = 0;
                    break;
                default:
                    this.sprite.frame += 1;
            }
            this.spinTime = this.game.time.now + 100;
        }
    };

    return Planetoid;
})

.factory('PlanetoidLarge', function(Planetoid, PlanetoidMedium) {

    var PlanetoidLarge = function(index, game, player, children, gChildren) {
        Planetoid.call(this, game, player);
        var y = game.world.randomY,
            x;
        if(Math.floor(Math.random()*2)+1 == 1) x = 0;
        else x = game.width;

        this.children = children;
        this.gchildren = gChildren;

        this.sprite = game.add.sprite(x, y, 'ptoidLg');
        this.sprite.angle = game.rnd.angle();
        utils.centerGameObject([this.sprite]);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        game.physics.arcade.velocityFromRotation(this.sprite.rotation, 100, this.sprite.body.velocity);
        this.sprite.name = index.toString();
        this.sprite.type = 'ptoidLg';
        this.sprite.body.immovable = false;
        this.sprite.body.bounce.setTo(1, 1);
    };

    PlanetoidLarge.prototype = Planetoid.prototype;

    PlanetoidLarge.prototype.lgDamage = function() {
        this.sprite.kill();
        this.alive = false;
        for(var i=0; i<2; i++) {
            this.children.push(new PlanetoidMedium(this.children.length, this.game, this.player, this.gchildren, this.sprite));
        }
    };

    return PlanetoidLarge;
})

.factory('PlanetoidMedium', function(Planetoid, PlanetoidSmall) {
    var PlanetoidMedium = function(index, game, player, children, parent) {
        Planetoid.call(this, game, player);

        this.children = children;
        this.parent = parent;

        this.sprite = game.add.sprite(parent.x, parent.y, 'ptoidMd');
        if(index%2==0) this.sprite.angle = 45;
        else this.sprite.angle = -45;
        utils.centerGameObject([this.sprite]);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        game.physics.arcade.velocityFromRotation(this.sprite.rotation, 100, this.sprite.body.velocity);
        this.sprite.name = index.toString();
        this.sprite.type = 'ptoidMd';
        this.sprite.body.immovable = false;
        this.sprite.body.bounce.setTo(1, 1);
    };

    PlanetoidMedium.prototype = Planetoid.prototype;

    PlanetoidMedium.prototype.mdDamage = function() {
        this.sprite.kill();
        this.alive = false;
        for(var i=0; i<2; i++) {
            this.children.push(new PlanetoidSmall(this.children.length, this.game, this.player, this.sprite));
        }
    };

    return PlanetoidMedium;
})

.factory('PlanetoidSmall', function(Planetoid) {
    var PlanetoidSmall = function(index, game, player, parent) {
        Planetoid.call(this, game, player);

        this.parent = parent;

        this.sprite = game.add.sprite(parent.x, parent.y, 'ptoidSm');
        if(index%2==0) this.sprite.angle = 45;
        else this.sprite.angle = -45;
        utils.centerGameObject([this.sprite]);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        game.physics.arcade.velocityFromRotation(this.sprite.rotation, 100, this.sprite.body.velocity);
        this.sprite.name = index.toString();
        this.sprite.type = 'ptoidSm';
        this.sprite.body.immovable = false;
        this.sprite.body.bounce.setTo(1, 1);
    };

    PlanetoidSmall.prototype = Planetoid.prototype;

    PlanetoidSmall.prototype.damage = function() {
        this.sprite.kill();
        this.alive = false;
    };

    return PlanetoidSmall;
})
}());
