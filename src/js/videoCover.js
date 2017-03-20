(function () {
    'use strict';

angular.module('app.videoCover', [])

    .factory('videoCover', function() {
        var methods = {};

        methods.initVideoSize = function(video) {
            video.data('height', video.height());
            video.data('width', video.width());
            scaleSize(video)
        };

        function scaleSize(elem) {
            var windowWidth = $(window).width(),
                windowHeight = $(window).height(),
                aspectRatio = elem.data('height') / elem.data('width'),
                videoHeight, videoWidth;

            if(windowWidth < 1000) {
                videoHeight = windowHeight;
                videoWidth = windowWidth;
                elem.css({'margin-top': 0, 'margin-left': -(videoWidth - windowWidth) / 2 + "px"});
                elem.width(videoWidth).height(videoHeight);
            }else{
                videoHeight = windowHeight;
                videoWidth = windowWidth;
                elem.width(videoWidth).height(videoHeight);
            }
        }

        return methods;
    })
}());
