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