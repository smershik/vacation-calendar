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

