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


(function() {
    "use strict";

    var appModule = angular.module('ngVacationCalendar');

    appModule.filter('dateFilter', function () {
        return function (date) {
            return moment(date).format('DD-MM-YYYY');
        };
    });
})();
"use strict"

var appModule = angular.module('ngVacationCalendar');
appModule.service('storageSvc', storageSvc);
storageSvc.$inject = ['localStorageService'];

function storageSvc(localStorageService){
    return {
        createEmployee: createEmployee,
        updateEmployee: updateEmployee,
        deleteEmployee: deleteEmployee,
        getEmployeeById: getEmployeeById,
        getEmployees: getEmployees,
        createVacation: createVacation,
        updateVacation: updateVacation,
        deleteVacation: deleteVacation,
        getVacations: getVacations,
        getEmployeeVacations: getEmployeeVacations,
        getCurrentYearVacations: getCurrentYearVacations,
        getEmployeesByPosition: getEmployeesByPosition
    };

    function getEmployees(){
        return localStorageService.get('employees');
    };

    function setEmployees(employees){
        localStorageService.set('employees',employees);
    }

    function createEmployee(employee){
        var employees = getEmployees() || [];
        employee.id = generateId();
        employee.isOnVacation = false;
        employees.push(employee);
        setEmployees(employees);
    };

    function deleteEmployee(id){
        var employees = getEmployees();
        _.remove(employees, {'id': id});
        deleteVacationsByEmployeeId();
        setEmployees(employees);
    };

    function getEmployeeById(id) {
        var employees = getEmployees();
        return _.find(employees, {'id':id});
    };

    function updateEmployee(employee){
        var employees = getEmployees();
        var index = _.findIndex(employees, {'id': employee.id});
        employees.splice(index, 1, employee);
        setEmployees(employees);
    };

    function getVacations(){
        return localStorageService.get('vacations');
    };

    function setVacations(vacations){
        localStorageService.set('vacations',vacations);
    };

    function createVacation(vacation){
        var vacations = getVacations() || [];
        vacation.id = generateId();
        vacations.push(vacation);
        setVacations(vacations);
    };

    function deleteVacation(vacationId){
        var vacations = getVacations();
        _.remove(vacations, {'id': vacationId});
        setVacations(vacations);
    };

    function updateVacation(vacation){
        var vacations = getVacations();
        var index = _.findIndex(vacations, {'id': vacation.id});
        vacations.splice(index, 1, vacation);
        setVacations(vacations);
    };

    function generateId(){
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    function deleteVacationsByEmployeeId(employeeId){
        var vacations = getVacations();
        _.remove(vacations, function(vacation){
            return vacation.employeeId === employeeId;
        });
        setVacations(vacations);
    };

    function getEmployeeVacations(employeeId){
        var vacations = getVacations();
        var employeeVacations = _.filter(vacations, function(vacation){
            return vacation.employeeId === employeeId;
        });
        return employeeVacations;
    };

    function getCurrentYearVacations(employeeId, currentYear){
        currentYear = currentYear ? moment().year(currentYear) : moment().year();

        var sortedCurrentYearVacations = _.chain(getEmployeeVacations(employeeId))
            .filter(function (vacation){
                return moment(vacation.dateFrom).year() === currentYear;
            }).sortBy(function (vacation) {
                return vacation.dateFrom;
            }).value();

        return sortedCurrentYearVacations;
    };

    function getEmployeesByPosition(position){
       return  _.filter(getEmployees(),{position: position});
    };


};
"use strict"

var appModule = angular.module('ngVacationCalendar');
appModule.service('validationSvc', validationSvc);
validationSvc.$inject = ['storageSvc'];

function validationSvc(storageSvc){
    return {
        validateEmployee: validateEmployee,
        getMinDateFrom: getMinDateFrom,
        getMinDateTo: getMinDateTo,
        getMaxDateTo: getMaxDateTo,
        validateVacation: validateVacation
    };

    function validateEmployee(employee){
        var errors = [];

        var namePattern = /^[A-Za-z]{2,30}$/;

        if(_.isEmpty(employee.name) || !employee.name.match(namePattern)){
            errors.push('name');
        }
        if(_.isEmpty(employee.surname) || !employee.name.match(namePattern)){
            errors.push('surname');
        }

        if(_.isEmpty(errors)){
            return '';
        }else{
            return 'Form is incorrect. Check the '+errors.join(', ')+' fields';
        }
    };

    function getMinDateFrom(employeeId, currentYear) {
        var currentYearVacations = storageSvc.getCurrentYearVacations(employeeId, currentYear);
        var duration = getDurationOfVacations(currentYearVacations);

        if(_.isEmpty(currentYearVacations)){
            return moment().format();
        }else{
            var lastVacation = _.last(currentYearVacations);
            var lastDateTo = moment(lastVacation.dateTo);
            if(duration.days() < 25){
                var lastDuration = getDuration(lastVacation);
                return lastDateTo.add(lastDuration).format();
            }else{
                return moment().year(lastDateTo.year()+1).month(1).day(1).format();
            }
        }
    };

    function getMinDateTo(employeeId, dateFrom){
        return moment(dateFrom).add(2,'days').format();
    };

    function getMaxDateTo(employeeId, dateFrom){
        if(dateFrom){
            var currentYear = moment(dateFrom).year();
        }
        var currentYearVacations = storageSvc.getCurrentYearVacations(employeeId, currentYear);
        var duration = getDurationOfVacations(currentYearVacations);

        if(_.isEmpty(currentYearVacations)){
            return moment(dateFrom).add(15,'days').format();
        }else{
            if((25 - duration.days())>15){
                return moment(dateFrom).add(15,'days').format();
            }else{
                return moment(dateFrom).add((25 - duration.days()),'days').format();
            }
        }
    };

    function validateVacation(vacation){
        var errors = [];

        if(_.isEmpty(vacation.dateFrom)){
            errors.push('select date from');
        }

        if(_.isEmpty(vacation.dateTo)){
            errors.push('select date to');
        }

        var posErr  = checkVacationsOfPosition(vacation);
        if(posErr){
            errors.push(posErr);
        }

        if(_.isEmpty(errors)){
            return '';
        }else{
            return 'Form is incorrect - ' +errors.join(', ');
        }
    };


    function getDurationOfVacations(vacations){
        var duration = moment.duration(0);

        _.forEach(vacations, function (vacation){
            duration.add(getDuration(vacation));
        });

        return duration;
    };


    function getDuration(vacation){
        return moment.duration(moment(vacation.dateTo).diff(moment(vacation.dateFrom))).add(moment.duration(1,'minutes'));
    };

    function checkVacationsOfPosition(vacation){
        var employee = storageSvc.getEmployeeById(vacation.employeeId);
        var employees = storageSvc.getEmployeesByPosition(employee.position);
        var employeeCount = employees.length;

        if(employeeCount <= 1){
            return;
        }

        var crossedVacations = 0;

        _.forEach(employees, function(e){
            var employeeVacations = storageSvc.getEmployeeVacations(e.id);
            _.forEach(employeeVacations, function(v){
                if(isVacationsCrossed(vacation,v)){
                    crossedVacations+=1;
                }
            })
        });

        if(crossedVacations === 0 || crossedVacations < Math.floor(employeeCount / 2)){
            return;
        }
        else return "only half of employees can be on vacation at one time!";

    };

    function isVacationsCrossed(vacation1,vacation2){
        var dateFrom1 = moment(vacation1.dateFrom);
        var dateFrom2 = moment(vacation2.dateFrom);
        var dateTo1 = moment(vacation1.dateTo);
        var dateTo2 = moment(vacation2.dateTo);
        return (dateFrom1.isBefore(dateFrom2,'day') && dateTo1.isAfter(dateFrom2,'day')) ||
            (dateFrom1.isBefore(dateTo2,'day') && dateTo1.isAfter(dateTo2,'day')) ||
            (dateFrom1.isSame(dateFrom2,'day') || dateTo1.isSame(dateTo2,'day'));

    };

};
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
(function() {
    "use strict"
    appModule.controller('employeesCtrl', employeesCtrl);
    employeesCtrl.$inject = ['$scope','storageSvc', 'validationSvc'];

    function employeesCtrl($scope, storageSvc, validationSvc) {
        var vm = this;
        vm.employeesPositions = ['tester','developer','manager','accountant'];
        vm.selected = {};
        vm.employees = storageSvc.getEmployees();
        vm.addNewEmployee = addNewEmployee;
        vm.getRowTemplate = getRowTemplate;
        vm.resetUpdateForm = resetUpdateForm;
        vm.deleteEmployee = deleteEmployee;
        vm.editEmployee = editEmployee;
        vm.saveEmployee = saveEmployee;

        subscribeToEvents();

        function subscribeToEvents(){
            $scope.$watch(function(){
                return storageSvc.getEmployees();
            },function () {
                vm.employees = storageSvc.getEmployees();
            }, true);
        }

        function addNewEmployee(){
            var employee = {
                name: vm.name,
                surname: vm.surname,
                position: vm.position,
                isInVacation: false
            };

            vm.createError = validationSvc.validateEmployee(employee);

            if(!_.isEmpty(vm.createError)){
                return;
            }

            storageSvc.createEmployee(employee);
            resetCreateForm();
        }

        function resetCreateForm() {
            vm.name = '';
            vm.surname = '';
            vm.position = vm.employeesPositions[0];
        }

        function editEmployee(employee){
            vm.selected = angular.copy(employee);
        };

        function getRowTemplate(employee) {
            if (employee.id === vm.selected.id) return 'editEmployee';
            else return 'displayEmployee';
        };

        function saveEmployee() {
            vm.updateError = validationSvc.validateEmployee(vm.selected);

            if(!_.isEmpty(vm.updateError)){
                return;
            }

            storageSvc.updateEmployee(vm.selected);
            resetUpdateForm();
        };

        function resetUpdateForm(){
            vm.selected = {};
        };

        function deleteEmployee(id){
            storageSvc.deleteEmployee(id);
        }
    };
})();
(function() {
    "use strict";
    appModule.controller('vacationsCtrl', vacationsCtrl);
    vacationsCtrl.$inject = ['$scope', 'storageSvc', 'validationSvc'];

    function vacationsCtrl($scope, storageSvc, validationSvc){
        var vm = this;

        vm.employees = storageSvc.getEmployees();
        vm.vacations = storageSvc.getVacations();
        vm.getRowTemplate = getRowTemplate;
        vm.isDateToDisabled = isDateToDisabled;
        vm.getMinDateFrom = getMinDateFrom;
        vm.getMinDateTo = getMinDateTo;
        vm.getMaxDateTo = getMaxDateTo;
        vm.addNewVacation = addNewVacation;
        vm.resetVacationToEdit = resetVacationToEdit;
        vm.editVacation = editVacation;
        vm.deleteVacation = deleteVacation;
        vm.getEmployeeById = getEmployeeById;
        vm.saveVacation = saveVacation;
        vm.getClassForRow = getClassForRow;

        resetVacationToCreate();
        resetVacationToEdit();
        subscribeToEvents();

        vm.maxDateToCreate = null;
        vm.minDateToCreate = null;
        vm.maxDateToUpdate = null;
        vm.minDateToUpdate = null;

        vm.orderByField = 'dateFrom';
        vm.reverseSort = false;

        function subscribeToEvents() {
            $scope.$watch(function (){
                return storageSvc.getEmployees();
            }, function () {
                vm.employees = storageSvc.getEmployees();
            }, true);

            $scope.$watch(function (){
                return storageSvc.getVacations();
            },function () {
                vm.vacations = storageSvc.getVacations();
            }, true);

            $scope.$watch(function (){
                return vm.vacationToCreate.dateFrom;
            },function () {
                vm.maxDateToCreate = getMaxDateTo(vm.vacationToCreate.employeeId, vm.vacationToCreate.dateFrom);
                vm.minDateToCreate = getMinDateTo(vm.vacationToCreate.employeeId, vm.vacationToCreate.dateFrom);
            },true);

            $scope.$watch(function (){
                return vm.selected.dateFrom;
            },function(){
                vm.maxDateToUpdate = getMaxDateTo(vm.selected.employeeId, vm.selected.dateFrom);
                vm.minDateToUpdate = getMinDateTo(vm.selected.employeeId, vm.selected.dateFrom);
            },true)

        };

        function getRowTemplate(vacation) {
            if (vacation.id === vm.selected.id) return 'editVacation';
            else return 'displayVacation';
        };

        function isDateToDisabled() {
            return !vm.vacationToCreate.dateFrom;
        };

        function getMinDateFrom(employeeId){
          return validationSvc.getMinDateFrom(employeeId);
        };

        function getMinDateTo(employeeId, dateFrom){
            return validationSvc.getMinDateTo(employeeId, dateFrom);
        };

        function getMaxDateTo(employeeId, dateFrom){
            return validationSvc.getMaxDateTo(employeeId,dateFrom);
        };

        function addNewVacation(){
            vm.createError = validationSvc.validateVacation(vm.vacationToCreate);

            if(!_.isEmpty(vm.createError)){
                return;
            }
            vm.vacationToCreate.dateFrom = moment(vm.vacationToCreate.dateFrom).hours(0).minutes(0).seconds(0);
            vm.vacationToCreate.dateTo = moment(vm.vacationToCreate.dateTo).hours(0).minutes(0).seconds(0);
            storageSvc.createVacation(vm.vacationToCreate);
            resetVacationToCreate();
        };

        function resetVacationToCreate(){
            vm.vacationToCreate = {
                employeeId: vm.employees[0].id || '',
                dateFrom: null,
                dateTo: null
            };
        };

        function resetVacationToEdit(){
            vm.selected = {
                employeeId: vm.employees[0].id || '',
                dateFrom: null,
                dateTo: null
            };
        };

        function editVacation(vacation){
            vm.selected = angular.copy(vacation);
        };

        function deleteVacation(vacationId){
            storageSvc.deleteVacation(vacationId);
        };

        function getEmployeeById(employeeId){
            return storageSvc.getEmployeeById(employeeId);
        };

        function saveVacation() {
            vm.updateError = validationSvc.validateVacation(vm.selected);

            if(!_.isEmpty(vm.updateError)){
                return;
            }

            vm.selected.dateFrom = moment(vm.selected.dateFrom).hours(0).minutes(0).seconds(0);
            vm.selected.dateTo = moment(vm.selected.dateTo).hours(0).minutes(0).seconds(0);

            storageSvc.updateVacation(vm.selected);
            resetVacationToEdit();
        };

        function getClassForRow(vacation){
            if(moment(vacation.dateFrom).isBefore(moment()) && moment(vacation.dateTo).isAfter(moment())){
                return 'present';
            }
            if(moment(vacation.dateTo).isBefore(moment())){
                return 'past';
            }
            if(moment(vacation.dateFrom).isAfter(moment())){
                return 'future';
            }
        };

    };
})();

