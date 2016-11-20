(function () {
    'use strict';
angular.module('planetoid.gameStates', [])

.factory('BootState', function BootState(LoadState) {
    return function(game){
        return {
            preload: function() {
                // Load Background Image
                game.load.image('bgMenu', 'img/planetoid/backgrounds/bgMenu.png');
                game.load.image('loadingBar', 'img/planetoid/loading.png');
                game.load.script('utils',   'js/planetoid/utils.js');
            },

            create: function() {
                // Scaling Options & Resize Callback
                game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                game.scale.pageAlignHorizontally = true;
                game.scale.pageAlignVertically = true;
                // Load Physics Engine
                game.physics.startSystem(Phaser.Physics.ARCADE);
                game.state.add('Load', LoadState(game));
                game.state.start('Load');
            }
        }
    }
})

.factory('LoadState', function LoadState(MenuState) {
    return function(game) {
        return {
            preload: function(){
                // Display Loading Bar while Laoding
                var loadingBar, status;
                loadingBar = game.add.sprite(game.world.centerX, game.world.centerY, 'loadingBar');
                status = game.add.text(game.world.centerX, game.world.centerY - 100, 'Loading...', {fill: 'white'});
                utils.centerGameObject([loadingBar, status]);
                game.load.setPreloadSprite(loadingBar);

                // Load Assets
                game.load.image('bgLevel1', 'img/planetoid/backgrounds/bgLevel1.png');
                game.load.image('btnStart', 'img/planetoid/buttons/startButton.png');

                game.load.image('player', 'img/planetoid/ships/playerShip.png');
                game.load.image('enemySm1', 'img/planetoid/ships/smallEnemy.png');
                game.load.image('enemySm2', 'img/planetoid/ships/smallEnemy2.png');
                game.load.image('enemyMd', 'img/planetoid/ships/mediumEnemy.png');
                game.load.image('enemyLg', 'img/planetoid/ships/largeEnemy.png');

                game.load.spritesheet('health', 'img/planetoid/health/health.png', 62, 17, 6);

                game.load.image('ptoidSm', 'img/planetoid/planetoids/planetoidSm.png');
                game.load.image('ptoidSm2', 'img/planetoid/planetoids/planetoidSm2.png');
                game.load.image('ptoidMd', 'img/planetoid/planetoids/planetoidMd.png');
                game.load.image('ptoidMd2', 'img/planetoid/planetoids/planetoidMd2.png');
                game.load.image('ptoidLg', 'img/planetoid/planetoids/planetoidLg.png');
                game.load.image('ptoidLg2', 'img/planetoid/planetoids/planetoidLg2.png');
                game.load.image('ptoidSpcl', 'img/planetoid/planetoids/planetoidSpecial.png');

                game.load.image('laserRed', 'img/planetoid/bullets/laserRed.png');
                game.load.image('laserOrange', 'img/planetoid/bullets/laserOrange.png');
                game.load.spritesheet('explosion', 'img/planetoid/explosions/explosion_01.png', 196, 190);
            },
            create: function() {
                game.state.add('Menu', MenuState(game));
                game.state.start('Menu');
            }
        }
    }
})

.factory('MenuState', function MenuState(PlayState) {
    return function(game) {
        function playGame() {
            game.state.add('Play', PlayState(game));
            game.state.start('Play');
        }
        return {
            preload: function(){

            },
            create: function() {
                // Add Background Image
                var background = game.add.sprite(0, 0, 'bgMenu');
                background.height = game.height;
                background.width = game.width;
                // Add Start Button
                var btnStart = game.add.button(game.world.centerX, game.height - 250, 'btnStart');
                utils.centerGameObject([btnStart]);
                btnStart.events.onInputDown.add(playGame)
            }
        }
    }
})

.factory('PlayState', function PlayState(EnemySmall, Player) {
    return function(game) {
        var player, enemies, cursors, pBullets, eBullets,
            explosions, enemiesTotal, enemiesAlive,
            enemyTime = 0;

        function bulletHitPlayer(player, bullet) {
            console.log('bullet hit player');
            bullet.kill();
            player.damage();
        }

        function bulletHitEnemy(ship, bullet) {
            bullet.kill();

            var destroyed = enemies[ship.name].damage();

            if(destroyed){
                var explosion =  explosions.getFirstExists(false);
                explosion.reset(ship.x, ship.y);
                explosion.play('explosion', 30, false, true);
            }
        }

        return {
            preload: function() {},
            create: function() {
                // Background
                game.add.tileSprite(0, 0, game.width, game.height, 'bgLevel1');

                // Player Bullets
                pBullets = game.add.group();
                pBullets.enableBody = true;
                pBullets.physicsBodyType  = Phaser.Physics.ARCADE;
                pBullets.createMultiple(40, 'laserRed');
                pBullets.setAll('anchor.x', 0.5);
                pBullets.setAll('anchor.y', 0.5);

                // Enemy Bullets
                eBullets = game.add.group();
                eBullets.enableBody = true;
                eBullets.physicsBodyType  = Phaser.Physics.ARCADE;
                eBullets.createMultiple(100, 'laserOrange');
                eBullets.setAll('anchor.x', 0.5);
                eBullets.setAll('anchor.y', 0.5);

                // Explosions
                explosions = game.add.group();
                for (var i = 0; i < 10; i++) {
                    var explosion = explosions.create(0, 0, 'explosion', [0], false);
                    explosion.anchor.setTo(0.5, 0.5);
                    explosion.animations.add('explosion');
                }

                // Player Ship
                player = new Player(game, pBullets);

                // First Enemy Ship and enemy values
                enemies = [];
                enemiesTotal = 20;
                enemiesAlive = 1;
                enemies.push(new EnemySmall(0, game, player.ship, eBullets));


                // Game Input
                cursors = game.input.keyboard.createCursorKeys();
                game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
            },
            update: function() {
                // Collisions
                game.physics.arcade.overlap(eBullets, player.ship, bulletHitPlayer, null, this);

                // Add Enemies
                if(game.time.now > enemyTime && enemies.length < enemiesTotal) {
                    enemies.push(new EnemySmall(enemies.length, game, player.ship, eBullets));
                    enemyTime = game.time.now + 30000;
                }

                // Update each enemy
                enemiesAlive= 0;
                for(var i=0; i<enemies.length; i++){
                    if(enemies[i].alive){
                        enemiesAlive++;
                        game.physics.arcade.collide(player.ship, enemies[i].ship);
                        game.physics.arcade.overlap(pBullets, enemies[i].ship, bulletHitEnemy, null, this);
                        utils.screenWrap(enemies[i].ship, game);
                        enemies[i].update();
                    }
                }

                // Keys Presses
                // Up  and Down
                if (cursors.up.isDown) {
                    game.physics.arcade.accelerationFromRotation(player.ship.rotation, 200, player.ship.body.acceleration);
                }else if(cursors.down.isDown) {
                    game.physics.arcade.accelerationFromRotation(player.ship.rotation * -1, 200, player.ship.body.acceleration);
                } else {
                    player.ship.body.acceleration.set(0);
                }
                // Left and Right
                if (cursors.left.isDown) {
                    player.ship.body.angularVelocity = -300;
                } else if (cursors.right.isDown) {
                    player.ship.body.angularVelocity = 300;
                } else {
                    player.ship.body.angularVelocity = 0;
                }
                // Spacebar
                if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                    player.fireLaser();
                }
                utils.screenWrap(player.ship, game);
                pBullets.forEachExists(utils.screenWrap, this, game);
            }
        }
    }
})
}());
