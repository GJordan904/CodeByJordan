(function(){'use strict';

angular.module('app', [
    'app.controllers',
    'app.directives',
    'planetoid',
    'ngAnimate',
    'ngCookies',
    'duScroll',
    'angular-inview',
    'ui.router'
])

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            url: '',
            abstract: true,
            templateUrl: 'views/main.html',
            controller: 'AppCtrl as app'
        })
        .state('app.home', {
            url: '/home',
            views: {
                'mainContent': {
                    templateUrl: 'views/home.html',
                    controller: 'HomeCtrl as home'
                }
            }
        });

    $urlRouterProvider
        .otherwise('/home');
});
}());