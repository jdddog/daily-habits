angular.module('dailyHabits').controller('habitCtrl', function ($scope, localStorageService) {

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
        $scope.closeDialog();

        if (!$scope.selectedHabit.hasOwnProperty('habitId')) {
            $scope.selectedHabit.habitId = uuid.v4();
            localStorageService.set($scope.selectedHabit.habitId, $scope.selectedHabit);
            $scope.createEvents($scope.selectedHabit);
        }
        else
        {
            localStorageService.set($scope.selectedHabit.habitId, $scope.selectedHabit);
            $scope.deleteEvents($scope.selectedHabit);
        }
    };

    $scope.createEvents = function (habit) {
        var currentDate = moment();
        var events = [];

        for (var d = 0; d < habit.numDays; d++) {
            events.push({
                title: habit.name,
                start: currentDate.clone().toDate(),
                end: currentDate.clone().toDate(),
                habitId: habit.habitId
            });

            currentDate.add(1, 'day');
        }

        $scope.client.addEvents($scope.calendarId, events).then(function (data) {
            $scope.today();
        });
    };

    $scope.deleteEvents = function (habit) {
        var currentDate = moment().startOf('day');

        $scope.client.listEvents($scope.calendarId).then(function (data) {
            var eventIds = [];
            for (var i = 0; i < data.length; i++) {
                var event = data[i];
                if (habit.habitId == event.habitId && event.start >= currentDate) {
                    eventIds.push(event.id);
                }
            }

            $scope.client.deleteEvents($scope.calendarId, eventIds).then(function (data) {
                $scope.createEvents(habit);
            }).catch(function (error) {
                console.log(JSON.stringify(error));
            });
        });
    };
});
