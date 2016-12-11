(function(){'use strict';

angular.module('planetoid.leaderboard', [])

.factory('leaderFact', function($http, $q) {
    var board = {};

    board.playerName = null;

    board.playerId = null;

    board.setPlayerId = function() {
        var params = {
            action: 'getUserId'
        };
        $http.get('./php/leaderboard.php', {params: params})
            .then(function(response){
                board.playerId = response.data;
            });
    };

    board.nameExists = function(name) {
        console.log('nameExists fired');
        var q = $q.defer(),
            params = {
                action: 'userExists',
                name: name
            },
            data = {
                action: 'addUser',
                name: name
            };

        $http.get('./php/leaderboard.php', {params: params})
            .then(function(response){
                console.log(response);
                var exists = response.data.exists;
                switch(exists) {
                    case true:
                        q.resolve(exists);
                        break;
                    case false:
                        $http.post('./php/leaderboard.php', data)
                            .then(function(response) {
                                console.log(response);
                                var userId = response.data.id;
                                if(isNaN(userId)) q.resolve(true);
                                else q.resolve(userId);
                            });
                }
            });
        return q.promise;
    };

    board.saveScore = function(score, level) {
          var data = {
              action: 'addScore',

          }
    };

    return board;
});
}());