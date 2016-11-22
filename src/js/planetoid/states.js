(function () {
    'use strict';
angular.module('planetoid.gameStates', [])

.factory('BootState', function(LoadState) {
    var BootState = function() {};

    BootState.prototype.init = function(game) {
        this.game = game;
    };

    BootState.prototype.preload = function() {
        this.game.load.image('bgMenu', 'img/planetoid/backgrounds/bgMenu.png');
        this.game.load.image('loadingBar', 'img/planetoid/loading.png');
        this.game.load.script('utils',   'js/planetoid/utils.js');
    };

    BootState.prototype.create = function() {
        // Scaling Options & Resize Callback
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        // Load Physics Engine
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.state.add('Load', new LoadState(game));
        this.game.state.start('Load');
    };

    return BootState;
})

.factory('LoadState', function(MenuState) {
    var LoadState = function(game) {
        this.game = game;
    };

    LoadState.prototype.preload = function() {
        var game = this.game;
        // Display Loading Bar while Laoding
        var loadingBar, status;
        loadingBar = game.add.sprite(game.world.centerX, game.world.centerY, 'loadingBar');
        status = game.add.text(game.world.centerX, game.world.centerY - 100, 'Loading...', {fill: 'white'});
        utils.centerGameObject([loadingBar, status]);
        game.load.setPreloadSprite(loadingBar);

        // Load Assets
        game.load.image('bgLevel1', 'img/planetoid/backgrounds/bgLevel1.png');
        game.load.image('bgLost', 'img/planetoid/backgrounds/bgLost.png');

        game.load.image('btnStart', 'img/planetoid/buttons/startButton.png');
        game.load.image('btnMenu', 'img/planetoid/buttons/menuButton.png');
        game.load.image('btnRestart', 'img/planetoid/buttons/restartButton.png');

        game.load.image('player', 'img/planetoid/ships/playerShip.png');
        game.load.image('enemySm1', 'img/planetoid/ships/smallEnemy.png');
        game.load.image('enemySm2', 'img/planetoid/ships/smallEnemy2.png');
        game.load.image('enemyMd', 'img/planetoid/ships/mediumEnemy.png');
        game.load.image('enemyLg', 'img/planetoid/ships/largeEnemy.png');

        game.load.spritesheet('health', 'img/planetoid/health/health.png', 166, 44);

        game.load.spritesheet('ptoidSm', 'img/planetoid/planetoids/SmallGrey.png', 32, 33);
        game.load.spritesheet('ptoidMd', 'img/planetoid/planetoids/MediumGrey.png', 61, 61);
        game.load.spritesheet('ptoidLg', 'img/planetoid/planetoids/LargeGrey.png', 159, 159);
        game.load.image('ptoidSpcl', 'img/planetoid/planetoids/planetoidSpecial.png');

        game.load.image('laserRed', 'img/planetoid/bullets/laserRed.png');
        game.load.image('laserOrange', 'img/planetoid/bullets/laserOrange.png');
        game.load.spritesheet('explosion', 'img/planetoid/explosions/explosion_01.png', 196, 190);
    };

    LoadState.prototype.create = function() {
        this.game.state.add('Menu', new MenuState());
        this.game.state.start('Menu', true, false, this.game);
    };

    return LoadState;
})

.factory('MenuState', function(PlayState, LostState) {

    var MenuState = function() {};

    MenuState.prototype.init = function(game) {
        this.game = game;
    };

    MenuState.prototype.create = function() {
        // Add Background Image
        var background = this.game.add.sprite(0, 0, 'bgMenu');
        background.height = this.game.height;
        background.width = this.game.width;
        // Add Start Button
        var btnStart = this.game.add.button(this.game.world.centerX, this.game.height - 250, 'btnStart');
        utils.centerGameObject([btnStart]);
        btnStart.events.onInputDown.add(playGame, this);
    };

    function playGame() {
        this.game.state.add('Play', new PlayState());
        this.game.state.add('Lost', new LostState());
        this.game.state.start('Play', true, false, this.game);
    }

    return MenuState;
})

.factory('PlayState', function (EnemySmall, Player, PlanetoidLarge, $timeout) {

    var PlayState = function(){};

    PlayState.prototype.init = function(game) {
        this.game = game;
        this.enemies = [];
        this.enemiesTotal = 10;
        this.enemyTime = game.time.now + 5000;
        this.ptoidsLg = [];
        this.ptoidsMd = [];
        this.ptoidsSm = [];
        this.ptoidTotal = 0;
        this.ptoidTime = 0;
        this.score = 0;
        this.scoreBuffer = 0;
        this.scoreHolder = 0;
    };

    PlayState.prototype.preload = function() {
        // Background
        this.game.add.sprite(0, 0, 'bgLevel1');
        // Bullets and Explosions
        this.pBullets = this.game.add.group();
        this.eBullets = this.game.add.group();
        this.explosions = this.game.add.group();
        // Player
        this.player = new Player(this.game, this.pBullets, this.explosions);
        // Buttons
        this.cursors = this.game.input.keyboard.createCursorKeys();
    };

    PlayState.prototype.create = function() {
        // Player Bullets
        this.pBullets.enableBody = true;
        this.pBullets.physicsBodyType  = Phaser.Physics.ARCADE;
        this.pBullets.createMultiple(40, 'laserRed');
        this.pBullets.setAll('anchor.x', 0.5);
        this.pBullets.setAll('anchor.y', 0.5);

        // Enemy Bullets
        this.eBullets.enableBody = true;
        this.eBullets.physicsBodyType  = Phaser.Physics.ARCADE;
        this.eBullets.createMultiple(100, 'laserOrange');
        this.eBullets.setAll('anchor.x', 0.5);
        this.eBullets.setAll('anchor.y', 0.5);

        // Explosions
        for (var i = 0; i < 10; i++) {
            var explosion = this.explosions.create(0, 0, 'explosion', [0], false);
            explosion.anchor.setTo(0.5, 0.5);
            explosion.animations.add('explosion');
        }

        // Score Label
        this.scoreLabel = this.game.add.text(this.game.world.centerX, 35, "0", {font: "50px Arial", fill: "#ffffff", stroke: "#535353", strokeThickness: 7});
        utils.centerGameObject([this.scoreLabel]);
        this.scoreLabel.align = 'center';
        this.scoreLabelTween = this.add.tween(this.scoreLabel.scale).to({x:1.5, y:1.5}, 200, Phaser.Easing.Linear.In).to({x:1, y:1}, 200, Phaser.Easing.Linear.In);

        // Game Input
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    };

    PlayState.prototype.update = function() {
        // Update Score
        while(this.scoreBuffer > 0){
            this.score += 1;
            this.scoreLabel.text = this.score;
            this.scoreBuffer--;
        }

        // Collisions
        this.game.physics.arcade.overlap(this.eBullets, this.player.sprite, bulletHitPlayer, null, this);

        // Add Enemies
        if(this.game.time.now > this.enemyTime && this.enemies.length < this.enemiesTotal) {
            this.enemies.push(new EnemySmall(this.enemies.length, this.game, this.player.sprite, this.eBullets));
            this.enemyTime = this.game.time.now + 15000;
        }

        // Add Planetoids
        if(this.game.time.now > this.ptoidTime && this.ptoidTotal < 7) {
            this.ptoidsLg.push(new PlanetoidLarge(this.ptoidsLg.length, this.game, this.player, this.ptoidsMd, this.ptoidsSm));
            this.ptoidTime = this.game.time.now + 5000;
            this.ptoidTotal++;
        }

        // Update enemies and planetoids
        updateBodies(this, this.enemies, collision, bulletHitEnemy);
        updateBodies(this, this.ptoidsLg, collision, bulletHitPtoid);
        updateBodies(this, this.ptoidsMd, collision, bulletHitPtoid);
        updateBodies(this, this.ptoidsSm, collision, bulletHitPtoid);


        // Keys Presses
        // Up  and Down
        if (this.cursors.up.isDown) {
            this.game.physics.arcade.accelerationFromRotation(this.player.sprite.rotation, 200, this.player.sprite.body.acceleration);
        }else if(this.cursors.down.isDown) {
            this.game.physics.arcade.accelerationFromRotation(this.player.sprite.rotation * -1, 200, this.player.sprite.body.acceleration);
        } else {
            this.player.sprite.body.acceleration.set(0);
        }
        // Left and Right
        if (this.cursors.left.isDown) {
            this.player.sprite.body.angularVelocity = -300;
        } else if (this.cursors.right.isDown) {
            this.player.sprite.body.angularVelocity = 300;
        } else {
            this.player.sprite.body.angularVelocity = 0;
        }
        // Spacebar
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.player.fireLaser();
        }
        utils.screenWrap(this.player.sprite, this.game);
        this.pBullets.forEachExists(utils.screenWrap, this, this.game);
    };

    PlayState.prototype.score = 0;

    //
    // Private Methods
    //
    function scoreAnimation(x, y, score, context) {
        var scoreAnimation = context.game.add.text(x, y, '+'+score, {font: '45px Arial', fill: "#DB5461", stroke: "#686963", strokeThickness: 7});
        scoreAnimation.anchor.setTo(0.5, 0);
        scoreAnimation.align = 'center';

        var scoreTween = context.game.add.tween(scoreAnimation).to({x:context.game.world.centerX, y: 50}, 800, Phaser.Easing.Exponential.In, true);
        scoreTween.onComplete.add(function(){
            scoreAnimation.destroy();
            context.scoreLabelTween.start();
            context.scoreHolder = 0;
            context.scoreBuffer += score;
        }, context);
    }

    function updateBodies(context, type, collide, overlap) {
        type.forEach(function(obj){
            if(obj.alive) {
                context.game.physics.arcade.collide(context.player.sprite, obj.sprite, collide, null, context);
                context.game.physics.arcade.overlap(context.pBullets, obj.sprite, overlap, null, context);
                switch(obj.sprite.type){
                    case'ptoidLg':case'ptoidMd':case'ptoidSm':
                        context.game.physics.arcade.overlap(context.eBullets, obj.sprite, overlap, null, context);
                        break;
                }
                utils.screenWrap(obj.sprite, context.game);
                obj.update();
            }
        })
    }

    function bulletHitPlayer(player, bullet) {
        bullet.kill();
        playerDamaged(1, this);
    }

    function playerDamaged(amount, context) {
        var destroyed = context.player.damage(amount);
        if(destroyed) {
            context.pBullets.forEach(function(bullet){if(bullet.alive)bullet.kill()});
            context.player.kill(context.score+context.scoreBuffer+context.scoreHolder);
            $timeout(function() {
                context.enemies.forEach(function(enemy){if(enemy.alive)finalExplode(enemy.sprite, context)});
                context.ptoidsLg.forEach(function(ptoid){if(ptoid.alive)finalExplode(ptoid.sprite, context)});
                context.ptoidsMd.forEach(function(ptoid){if(ptoid.alive)finalExplode(ptoid.sprite, context)});
                context.ptoidsSm.forEach(function(ptoid){if(ptoid.alive)finalExplode(ptoid.sprite, context)});
            }, 1500);
        }
    }

    function bulletHitEnemy(ship, bullet) {
        bullet.kill();
        var destroyed = this.enemies[ship.name].damage();

        if(destroyed){
            explode(ship, this);
            scoredPoint('ship', ship, this);
        }
    }

    function explode(sprite, context) {
        var explosion =  context.explosions.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('explosion', 30, false, true);
    }

    function finalExplode(sprite, context) {
        sprite.kill();
        explode(sprite, context);
    }

    function bulletHitPtoid(ptoid, bullet) {
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
                scoredPoint(ptoid.type, ptoid, this);
                break;
        }
    }

    function collision(player, sprite) {
        switch(sprite.type) {
            case 'ptoidLg':
                this.ptoidTotal--;
                this.ptoidsLg[sprite.name].lgDamage();
                this.player.damage(10);
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
        }
    }

    function scoredPoint(type, sprite, context) {
        switch(type) {
            case 'ship':
                context.scoreHolder = 10;
                scoreAnimation(sprite.x, sprite.y, 10, context);
                break;
            case 'ptoidLg':
                context.scoreHolder = 1;
                scoreAnimation(sprite.x, sprite.y, 1, context);
                break;
            case 'ptoidMd':
                context.scoreHolder = 3;
                scoreAnimation(sprite.x, sprite.y, 3, context);
                break;
            case 'ptoidSm':
                context.scoreHolder = 5;
                scoreAnimation(sprite.x, sprite.y, 5, context);
                break;
        }
    }

    return PlayState;
})

.factory('LostState', function() {

    var LostState = function () {};

    LostState.prototype.init = function(game, score) {
        this.game = game;
        this.score = score;
    };

    LostState.prototype.create = function () {
        this.game.add.sprite(0, 0, 'bgLost');
        var btnMenu, btnRestart, goLabel, scoreNum, scoreLabel;
        // You Died
        goLabel = this.game.add.text(this.game.world.centerX, 125, "GAME OVER", {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});

        // Score
        scoreNum = this.game.add.text(this.game.world.centerX, 375, this.score, {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});
        scoreLabel = this.game.add.text(this.game.world.centerX, 450, 'Score', {font: '35px Arial', fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});

        // Buttons
        btnMenu = this.game.add.button(this.game.world.centerX - 250, this.game.world.height - 250, 'btnMenu', goToMenu, this);
        btnRestart = this.game.add.button(this.game.world.centerX + 250, this.game.world.height - 250, 'btnRestart', restart, this);

        utils.centerGameObject([goLabel, scoreNum, scoreLabel, btnMenu, btnRestart]);
    };

    //
    // Private Methods
    //
    function goToMenu() {
        this.game.state.start('Menu', true, false, this.game);
    }

    function restart() {
        this.game.state.start('Play', true, false, this.game);
    }

    return LostState;
})
}());
