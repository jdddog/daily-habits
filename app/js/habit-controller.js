
angular.module('dailyHabits').controller('habitCtrl', function ($scope, localStorageService, $q) {

    $scope.validateDate = function (date) {
        return date > moment();
    };

    $scope.updateNumDays = function () {
        $scope.selectedHabit.numDays = Math.ceil(moment($scope.selectedHabit.endDate).diff(moment(), 'days', true));
    };

    $scope.updateDate = function () {
        $scope.selectedHabit.endDate = moment().add($scope.selectedHabit.numDays, 'days').toDate();
    };

    $scope.saveHabit = function () {
        $scope.selectedHabit.habitId = uuid.v4();
        localStorageService.set($scope.selectedHabit.habitId, $scope.selectedHabit); //TODO: change to calendar api when can store custom fields in calendar
        $scope.closeDialog();
        $scope.createEvents($scope.selectedHabit).then(function (data) {
            $scope.today();
        });
    };

    $scope.createEvents = function (habit) {
        return $q(function (resolve, reject) {
            var currentDate = moment();
            var events = [];

            for (var d = 0; d < habit.numDays; d++) {
                var day = currentDate.day();

                events.push({
                    title: habit.name,
                    start: currentDate.clone().toDate(),
                    end: currentDate.clone().toDate(),
                    habitId: habit.habitId
                });

                currentDate.add(1, 'day');
            }

            $scope.client.addEvents($scope.calendarId, events).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
});
