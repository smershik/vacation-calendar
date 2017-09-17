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