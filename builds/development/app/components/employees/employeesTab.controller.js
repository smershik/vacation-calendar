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