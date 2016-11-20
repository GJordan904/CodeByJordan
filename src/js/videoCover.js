(function () {
    'use strict';

angular.module('app.videoCover', [])

    .factory('videoCover', function() {
        var methods = {};
        // Elements
        var vidCover = $('.video-cover'),
            poster = $('.video-container .poster img'),
            filter = $('.video-container .filter'),
            video = $('.video-container video');

        methods.initVideoSize = function() {
            initSize(poster);
            initSize(filter);
            initSize(video);
            vidCover.css('height', video.height());
        };

        methods.scaleVideoSize = function() {
            scaleSize(poster);
            scaleSize(filter);
            scaleSize(video);
            vidCover.css('height', video.height());
        };

        function initSize(element) {
            element.each(function() {
                $(this).data('height', $(this).height());
                $(this).data('width', $(this).width());
            });
            scaleSize(element)
        }

        function scaleSize(element) {
            var windowWidth = $(window).width(),
                windowHeight = $(window).height() + 5,
                videoWidth,
                videoHeight;

            element.each(function(){
                var aspectRatio = $(this).data('height') / $(this).data('width');

                $(this).width(windowWidth);

                if(windowWidth < 1000) {
                    videoHeight = windowHeight;
                    videoWidth = videoHeight / aspectRatio;
                    $(this).css({'margin-top': 0, 'margin-left': -(videoWidth - windowWidth) / 2 + "px"});
                    $(this).width(videoWidth).height(videoHeight);
                }
            })
        }

        return methods;
    })
}());
