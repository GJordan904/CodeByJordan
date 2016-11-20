(function(){
   'use strict';

angular.module('app.controllers', [])

.controller('AppCtrl', function(){
   var vm = this;
})

.controller('HomeCtrl', function(videoCover){
    var vm = this;

    videoCover.initVideoSize();

    $(window).on('resize', function() {
        videoCover.scaleVideoSize();
    })
});
}());