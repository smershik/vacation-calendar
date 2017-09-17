// initialize material design js
$.material.init();

ngVacationCalendar = angular.module('ngVacationCalendar', ['LocalStorageModule','ngRoute','moment-picker']);

ngVacationCalendar.config(function (localStorageServiceProvider,$routeProvider,momentPickerProvider) {
    localStorageServiceProvider
        .setPrefix('vacationCalendar');

    $routeProvider
        .when('/',{
            templateUrl:'app/main/main.html',
            controller:'mainCtrl',
            controllerAs: 'mainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    momentPickerProvider.options({
        'set-on-select': true,
        'max-view': 'month',
        'validate': true,

    });
});

