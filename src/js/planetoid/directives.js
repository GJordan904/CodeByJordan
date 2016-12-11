(function(){
    'use strict';
angular.module('planetoid.directives', [])

.directive('game', function(BootState) {
    return {
        restrict: 'E',
        template: '<div id="game-canvas" class="full-size"></div>',
        link: function(scope, elem, attrs) {
            var container = elem.find('#game-canvas');

            var height  = parseInt(container.css('height'), 10),
                width   = parseInt(container.css('width'), 10);

            var game = new Phaser.Game(width, height, Phaser.AUTO, 'game-canvas');

            game.state.add('Boot', new BootState());
            game.state.start('Boot', true, false, game);
        }
    }
})

.directive('leaderboard', function(leaderFact) {
    return {
        restrict: 'E',
        templateUrl: 'views/partials/leaderboard.html',
        controllerAs: 'board',
        bindToController: true,
        controller: function($scope, $rootScope){
            var vm = this;

            vm.leaders = [];

            var setBoard =  function() {
                leaderFact.getLeaders().then(function(response){
                    vm.leaders = response;
                })
            };
            var updateBoard = $rootScope.$on('leaderbordUpdated', function () {
                setBoard();
            });

            setBoard();
            $scope.$on('$destroy', updateBoard);
        }
    }
});

}());
