(function() {
    "use strict";

    var appModule = angular.module('ngVacationCalendar');

    appModule.filter('dateFilter', function () {
        return function (date) {
            return moment(date).format('DD-MM-YYYY');
        };
    });
})();