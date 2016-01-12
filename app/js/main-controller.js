var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'LocalStorageModule']);

dailyHabits.controller('mainCtrl', function ($scope, localStorageService, $mdDialog) {
    $scope.client = new DiaryClient("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI1NzQ1MDgsImVtYWlsIjoiIiwidXNlcm5hbWUiOiJqZGlwMDA0QGF1Y2tsYW5kLmFjLm56IiwidXNlcl9pZCI6Mywib3JpZ19pYXQiOjE0NTI1NzQyMDh9.NYY5hvbhnzdSGez6MTKaD1Yb1VL3YS1IwXn-UkF2hGA");    $scope.calendarId = null;
    $scope.events = [];
    $scope.selectedHabit = null;
    $scope.displayedDay = moment();

    $scope.initialiseCalendar = function () {
        var calendarId = localStorageService.get("calendarId");

        if (calendarId == null) {
            $scope.client.addCalendar("Daily Habits").then(function (data) {
                $scope.calendarId = data.id;
                localStorageService.set("calendarId", $scope.calendarId);
            }).catch(function (error) {
                console.log(JSON.stringify(error));
            });
        } else {
            $scope.calendarId = calendarId;
            $scope.today();
        }
    };

    $scope.displayEvents = function() {
        $scope.currentDateStr = $scope.displayedDay.format('ddd Do MMM YYYY');
        var begin = $scope.displayedDay.clone().startOf('day');
        var end = $scope.displayedDay.clone().endOf('day');

        $scope.client.findEvents($scope.calendarId, begin.toDate(), end.toDate()).then(
            function (data) {
                $scope.events = data;
                $scope.$apply();
            }
        );
    };

    $scope.onEventChanged = function (event) {
        var cleanCopy = angular.copy(event);
        $scope.client.updateEvent($scope.calendarId, event.id, cleanCopy);
    };

    /*
     * Date navigation bar functions
     */

    $scope.today = function () {
        $scope.displayedDay = moment();
        $scope.displayEvents();
    };

    $scope.previousDay = function () {
        $scope.displayedDay.subtract(1, 'day');
        $scope.displayEvents();
    };

    $scope.nextDay = function () {
        $scope.displayedDay.add(1, 'day');
        $scope.displayEvents();
    };

    $scope.isDayEditable = function () {
        var start = moment().startOf('day');
        var end = moment().endOf('day');
        return start <= $scope.displayedDay && $scope.displayedDay <= end;
    };

    $scope.openNewHabitDialog = function (event) {
        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'habit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: 'habitCtrl'
        });
    };

    $scope.openEditHabitDialog = function (event, habit) {
        $scope.selectedHabit = localStorageService.get(habit.habitId);
        $scope.selectedHabit.endDate = new Date($scope.selectedHabit.endDate);

        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'habit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: 'habitCtrl'
        });
    };

    $scope.closeDialog = function()
    {
        $mdDialog.hide('');
    };

    $scope.initialiseCalendar();
});

