(function () {'use strict';

angular.module('planetoid.scoring', [])

.factory('Score', function(ptoidUtils) {

    var Score = function(game) {
        this.game = game;

        this.scoreLabel = this.game.add.text(this.game.world.centerX, 0, "0", {font: "50px Arial", fill: "#ffffff", stroke: "#535353", strokeThickness: 7});
        ptoidUtils.centerGameObject([this.scoreLabel]);
        ptoidUtils.scaleElements([this.scoreLabel], game);
        this.scoreLabel.y = this.scoreLabel.height/2;
        this.scoreLabel.align = 'center';
        this.scoreLabelTween = this.game.add.tween(this.scoreLabel.scale).to({x:1.5, y:1.5}, 200, Phaser.Easing.Linear.In).to({x:1, y:1}, 200, Phaser.Easing.Linear.In);

        this.score = 0;
        this.scoreBuffer = 0;
        this.scoreHolder = 0;
    };

    Score.prototype.scoredPoint = function(type, sprite) {
        switch(type) {
            case 'ship':
                this.scoreHolder = 10;
                scoreAnimation(sprite.x, sprite.y, 10, this);
                break;
            case 'ptoidLg':
                this.scoreHolder = 1;
                scoreAnimation(sprite.x, sprite.y, 1, this);
                break;
            case 'ptoidMd':
                this.scoreHolder = 3;
                scoreAnimation(sprite.x, sprite.y, 3, this);
                break;
            case 'ptoidSm':
                this.scoreHolder = 5;
                scoreAnimation(sprite.x, sprite.y, 5, this);
                break;
        }
    };

    Score.prototype.update = function() {
        while(this.scoreBuffer > 0){
            this.score += 1;
            this.scoreLabel.text = this.score;
            this.scoreBuffer--;
        }
    };

    Score.prototype.getScore = function() {
        return this.score + this.scoreBuffer + this.scoreHolder;
    };

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
        }, context.game);
    }

    return Score;
})

}());
