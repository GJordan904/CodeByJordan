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
    };

    BootState.prototype.create = function() {
        // Scaling Options & Resize Callback
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        // Load Physics Engine
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.state.add('Load', new LoadState(game));
        this.game.state.start('Load');
    };

    return BootState;
})

.factory('LoadState', function(MenuState, ptoidUtils) {
    var LoadState = function(game) {
        this.game = game;
    };

    LoadState.prototype.preload = function() {
        var game = this.game;
        // Display Loading Bar while Laoding
        var loadingBar, status;
        loadingBar = game.add.sprite(game.world.centerX, game.world.centerY, 'loadingBar');
        status = game.add.text(game.world.centerX, game.world.centerY - 100, 'Loading...', {fill: 'white'});
        ptoidUtils.centerGameObject([loadingBar, status]);
        game.load.setPreloadSprite(loadingBar);

        // Load Text Input Plugin
        game.add.plugin(Fabrique.Plugins.InputField);

        // Load Assets
        game.load.image('title', 'img/planetoid/title.png');
        game.load.image('bgLevel1', 'img/planetoid/backgrounds/bgLevel1.png');
        game.load.image('bgLevel2', 'img/planetoid/backgrounds/bgLevel2.png');
        game.load.image('bgWon', 'img/planetoid/backgrounds/bgWon.png');
        game.load.image('bgLost', 'img/planetoid/backgrounds/bgLost.png');

        game.load.image('btnStart', 'img/planetoid/buttons/startButton.png');
        game.load.image('btnMenu', 'img/planetoid/buttons/menuButton.png');
        game.load.image('btnRestart', 'img/planetoid/buttons/restartButton.png');
        game.load.image('btnNext', 'img/planetoid/buttons/nextButton.png');

        game.load.image('player', 'img/planetoid/ships/playerShip.png');
        game.load.image('enemySm1', 'img/planetoid/ships/smallEnemy.png');
        game.load.image('enemySm2', 'img/planetoid/ships/smallEnemy2.png');
        game.load.image('enemyMd', 'img/planetoid/ships/mediumEnemy.png');
        game.load.image('enemyLg', 'img/planetoid/ships/largeEnemy.png');

        game.load.spritesheet('health', 'img/planetoid/health/health.png', 166, 44);
        game.load.image('healthBonus', 'img/planetoid/planetoids/planetoidSpecial.png');

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

.factory('MenuState', function(PlayState, LostState, WonState, ptoidUtils, leaderFact, $cookies) {

    var MenuState = function() {};

    MenuState.prototype.init = function(game) {
        this.game = game;
    };

    MenuState.prototype.create = function() {
        // Add Background Image
        var background = this.game.add.sprite(0, 0, 'bgMenu');

        // Add Input Field For Name
        this.nameInput = this.game.add.inputField(this.game.world.centerX-100, this.game.world.centerY, {
            font: '18px Arial',
            fill: '#212121',
            fontWeight: 'bold',
            width: 200,
            padding: 8,
            borderWidth: 1,
            borderColor: '#DB5461',
            borderRadius: 6,
            type: Fabrique.InputType.text
        });
        // Check if user played before and set name if they have
        var username = $cookies.get('username');
        if(username !== undefined) this.nameInput.setText(username);
        else this.nameInput.setText('Create a Username');
        this.nameInput.blockInput = false;

        this.title = this.game.add.sprite(this.game.world.centerX, 0, 'title');
        this.title.y = this.title.height * 2;

        this.btnStart = this.game.add.button(0, 0, 'btnStart');
        this.btnStart.alignTo(this.nameInput, Phaser.BOTTOM_CENTER);
        this.btnStart.events.onInputDown.add(setUsername, this);

        ptoidUtils.scaleElements([this.title, this.btnStart, this.nameInput], this.game);
        ptoidUtils.centerGameObject([this.title]);
    };

    MenuState.prototype.resize = function() {
        ptoidUtils.scaleElements([this.title, this.btnStart, this.nameInput], this.game);
        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        this.title.x = this.game.world.centerX;
        this.title.y = this.title.height * 2;
        this.nameInput.x = this.game.world.centerX-100;
        this.nameInput.y = this.game.world.centerY;
        this.btnStart.alignTo(this.nameInput, Phaser.BOTTOM_CENTER);
    };

    // Helper Methods
    function setUsername() {
        // Check for username cookie and start game with that username if exists
        // If it doesn't exist, create a username record and start game
        var username = $cookies.get('username'),
            playerId = $cookies.get('playerId'),
            context = this;

        if(username !== undefined) {
            leaderFact.playerName = username;
            leaderFact.playerId = playerId;
            playGame(this);
        }else {
            username = this.nameInput.value;
            if(username === 'Create a Username' || username === '') {
                alert('Please enter your name to continue');
                return;
            }
            leaderFact.nameExists(username).then(function(response) {
                console.log('nameExists response: ');
                console.log(response);
                if(response === true){
                    alert("This name is already taken. If you created this name in the past then you have cleared your cookies or are accessing the site from a different device. Please choose another name.")
                }else{
                    $cookies.put('username', username);
                    $cookies.put('userId', response);
                    playGame(context)
                }
            });
        }
    }

    function playGame(context) {
        context.game.state.add('Play', new PlayState());
        context.game.state.add('Won', new WonState());
        context.game.state.add('Lost', new LostState());
        context.game.state.start('Play', true, false, context.game, 1, 5, 5000);
    }

    return MenuState;
})

.factory('PlayState', function
    (EnemySmall, Player, PlanetoidLarge, $timeout, Collisions, Score, HealthBonus, ptoidUtils, leaderFact) {

    var PlayState = function(){};

    PlayState.prototype.init = function(game, level, enemies, enemyBuffer) {
        this.game = game;
        this.level = level;
        this.enemiesTotal = enemies;
        switch(level){
            case 1:
                this.enemyType = EnemySmall;
                break;
            default:
                this.enemyType = EnemySmall;
                break;
        }

        this.bonuses = [];
        this.bonusTime = game.time.now + 45000;
        this.enemies = [];
        this.enemyBuffer = enemyBuffer;
        this.enemyTime = game.time.now + enemyBuffer;
        this.enemiesDead = 0;
        this.ptoidsLg = [];
        this.ptoidsMd = [];
        this.ptoidsSm = [];
        this.ptoidTotal = 0;
        this.ptoidTime = 0;
    };

    PlayState.prototype.preload = function() {
        // Background
        if(this.level % 2 == 0) {
            this.game.add.sprite(0, 0, 'bgLevel2');
        }else {
            this.game.add.sprite(0, 0, 'bgLevel1');
        }
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
        // Enemies Label
        this.enemyLabel = this.game.add.text(this.game.world.centerX, 0, 'Enemies Killed: 0/'+this.enemiesTotal, {font: "24px Arial", fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});
        ptoidUtils.scaleElements([this.enemyLabel], this.game);
        this.enemyLabel.y = this.game.height - (this.enemyLabel.height/2);

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
            ptoidUtils.centerGameObject([explosion]);
            explosion.animations.add('explosion');
        }


        // Scoring and Collisions Objects
        this.Score = new Score(this.game);
        this.Collision = new Collisions();
        // Game Input
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

        ptoidUtils.centerGameObject([this.enemyLabel]);
    };

    PlayState.prototype.update = function() {
        // Update Score and enemy label
        this.Score.update();
        this.enemyLabel.setText('Enemies killed: '+this.enemiesDead+'/'+this.enemiesTotal);
        // Collisions
        this.game.physics.arcade.overlap(this.eBullets, this.player.sprite, this.Collision.bulletHitPlayer, null, this);

        // Add Enemies
        if(this.game.time.now > this.enemyTime && this.enemies.length < this.enemiesTotal) {
            this.enemies.push(new this.enemyType(this.enemies.length, this.game, this.player.sprite, this.eBullets));
            this.enemyTime = this.game.time.now + 15000;
        }

        // Add Planetoids
        if(this.game.time.now > this.ptoidTime && this.ptoidTotal < 7) {
            this.ptoidsLg.push(new PlanetoidLarge(this.ptoidsLg.length, this.game, this.player, this.ptoidsMd, this.ptoidsSm));
            this.ptoidTime = this.game.time.now + 5000;
            this.ptoidTotal++;
        }

        // Add Bonuses
        if(this.game.time.now > this.bonusTime) {
            this.bonuses.push(new HealthBonus(this.bonuses.length, this.game, this.player));
            this.bonusTime = this.game.time.now + 30000;
        }

        // Update enemies and planetoids
        updateBodies(this, this.enemies, this.Collision.collided, this.Collision.bulletHitEnemy);
        updateBodies(this, this.ptoidsLg, this.Collision.collided, this.Collision.bulletHitPtoid);
        updateBodies(this, this.ptoidsMd, this.Collision.collided, this.Collision.bulletHitPtoid);
        updateBodies(this, this.ptoidsSm, this.Collision.collided, this.Collision.bulletHitPtoid);
        updateBodies(this, this.bonuses, this.Collision.collided, this.Collision.bulletHitBonus);

        // End level if all enemies dead
        if(this.enemiesDead == this.enemiesTotal) {
            this.game.state.start('Won', true, false, this.game, this.Score.getScore(), this.level, this.enemiesTotal, this.enemyBuffer);
            leaderFact.saveScore(this.Score.getScore(), this.level);
        }

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
        ptoidUtils.screenWrap(this.player.sprite, this.game);
        this.pBullets.forEachExists(ptoidUtils.screenWrap, this, this.game);
    };

    //
    // Private Methods
    //
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
                ptoidUtils.screenWrap(obj.sprite, context.game);
                obj.update();
            }
        })
    }

    return PlayState;
})

.factory('WonState', function(ptoidUtils) {
    var WonState = function(){};

    WonState.prototype.init = function(game, score, currentLevel, numEnemies, enemyBuffer){
        this.game = game;
        this.score = score;
        this.currentLevel = currentLevel;
        this.numEnemies = numEnemies;
        this.enemyBuffer = enemyBuffer;
    };

    WonState.prototype.create = function () {
        this.game.add.sprite(0, 0, 'bgWon');

        var btnMenu, btnNext, wonLabel, scoreNum, scoreLabel, levelLabel;
        // You Won
        wonLabel = this.game.add.text(this.game.world.centerX, 125, "You Won", {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});

        // Score
        levelLabel = this.game.add.text(this.game.world.centerX, 275, 'Level: '+this.currentLevel, {font: '75px Arial', fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});
        scoreNum = this.game.add.text(this.game.world.centerX, 450, this.score, {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});
        scoreLabel = this.game.add.text(this.game.world.centerX, 550, 'Score ', {font: '35px Arial', fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});

        // Buttons
        btnMenu = this.game.add.button(this.game.world.centerX - 250, this.game.world.height - 250, 'btnMenu', ptoidUtils.goToMenu, this, this.game);
        btnNext = this.game.add.button(this.game.world.centerX + 250, this.game.world.height - 250, 'btnNext', nextLevel, this);

        ptoidUtils.centerGameObject([wonLabel, scoreNum, levelLabel, scoreLabel, btnMenu, btnNext]);
        ptoidUtils.scaleElements([wonLabel, levelLabel, scoreNum, scoreLabel, btnMenu, btnNext], this.game);
    };

    function nextLevel() {
        this.currentLevel++;
        this.numEnemies += 3;
        this.enemyBuffer -= 333;
        this.game.state.start('Play', true, false, this.game, this.currentLevel, this.numEnemies, this.enemyBuffer);
    }

    return WonState;
})

.factory('LostState', function(ptoidUtils) {

    var LostState = function () {};

    LostState.prototype.init = function(game, score, level) {
        this.game = game;
        this.score = score;
        this.level = level;
    };

    LostState.prototype.create = function () {
        this.game.add.sprite(0, 0, 'bgLost');
        var btnMenu, btnRestart, goLabel, scoreNum, scoreLabel, levelLabel;
        // You Died
        goLabel = this.game.add.text(this.game.world.centerX, 125, "GAME OVER", {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});

        // Score
        levelLabel = this.game.add.text(this.game.world.centerX, 275, 'Level: '+this.level, {font: '75px Arial', fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});
        scoreNum = this.game.add.text(this.game.world.centerX, 450, this.score, {font: "150px Arial", fill: "#DB5461", stroke: "#686963", strokeThickness: 3});
        scoreLabel = this.game.add.text(this.game.world.centerX, 550, 'Score', {font: '35px Arial', fill: "#FFFFFF", stroke: "#686963", strokeThickness: 1});

        // Buttons
        btnMenu = this.game.add.button(this.game.world.centerX - 250, this.game.world.height - 250, 'btnMenu', ptoidUtils.goToMenu, this);
        btnMenu.game = this.game;
        btnRestart = this.game.add.button(this.game.world.centerX + 250, this.game.world.height - 250, 'btnRestart', restart, this);

        ptoidUtils.centerGameObject([goLabel, scoreNum, scoreLabel, levelLabel, btnMenu, btnRestart]);
        ptoidUtils.scaleElements([goLabel, levelLabel, scoreNum, scoreLabel, btnMenu, btnRestart], this.game);
    };

    //
    // Private Methods
    //

    function restart() {
        this.game.state.start('Play', true, false, this.game, 1, 5, 5000);
    }

    return LostState;
})
}());
