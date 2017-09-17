"use strict"

var appModule = angular.module('ngVacationCalendar');
appModule.controller('mainCtrl', mainCtrl);
mainCtrl.$inject = ['$scope'];

function mainCtrl($scope){
    var vm = this;
    vm.tabs = {employees: 1, vacations: 2};
    vm.activeTab = vm.tabs.employees;
    vm.setActiveTab  = setActiveTab;

    function setActiveTab(tab){
        vm.activeTab = tab;
    }

};