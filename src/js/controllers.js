(function(){
   'use strict';

angular.module('app.controllers', [])

.controller('AppCtrl', function(){
   var vm = this;
})

.controller('HomeCtrl', function(){
    var vm = this;

    // Render Google Hangout button
    gapi.hangout.render('hangout', {
        'render': 'createhangout',
        'invites': [{'id': 'grant.jordan904@gmail.com', 'invite_type': 'EMAIL'}]
    });
});
}());