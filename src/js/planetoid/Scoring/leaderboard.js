(function(){'use strict';

angular.module('planetoid.leaderboard', [])

.factory('leaderFact', function($http, $q, $rootScope, $cookies) {
    var board = {};

    board.playerName = null;

    board.playerId = null;

    board.nameExists = function(name) {
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
                var exists = response.data.exists;
                switch(exists) {
                    case true:
                        q.resolve(exists);
                        break;
                    case false:
                        $http.post('./php/leaderboard.php', data)
                            .then(function(response) {
                                var userId = response.data.id;
                                if(isNaN(userId)) q.resolve(true);
                                else q.resolve(userId);
                            });
                }
            });
        return q.promise;
    };

    board.saveScore = function(score, level) {
          var userId = $cookies.get('userId');
          var data = {
              action: 'addScore',
              userId: userId,
              score: score,
              level: level
          };
          $http.post('./php/leaderboard.php', data)
              .then(function(response) {
                  console.log(response);
                  if(response.data.success) {
                      $rootScope.$emit('leaderbordUpdated');
                  }
              });
          var params = {
              action: 'getUserScore'
          };
          $http.get('./php/leaderboard.php', {params: params})
              .then(function(response){
                if(response.data.length == 0 || response.data[0]['highScore'] < score) {
                    var data = {
                        action: 'setUserScore',
                        score: score,
                        userId: userId
                    };
                    $http.post('./php/leaderboard.php', data)
                        .then(function(response){
                            console.log(response);
                            $rootScope.$emit('userScoreUpdated');
                        });
                }
              });
    };

    board.getLeaders = function() {
        var q = $q.defer();
        var params = {
            action: 'getLeaders'
        };
        $http.get('./php/leaderboard.php', {params: params})
            .then(function(response){
                q.resolve(response.data);
            });
        return q.promise;
    };

    return board;
});
}());