var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'LocalStorageModule']);

dailyHabits.controller('mainCtrl', function ($scope, localStorageService, $mdDialog) {
    $scope.client = new UoACalendarClient("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnX2lhdCI6MTQyMjQ5ODk0OSwiZXhwIjoxNDIyNDk5MjQ5LCJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImRldmVsb3BlciIsImVtYWlsIjoidGVzdEBhdWNrbGFuZC5hYy5ueiJ9.7jLkEBovT2HvT2noL4xdIhddaY8wpZpEVYEDHnnNm1Y");
    $scope.events = [];
    $scope.selectedHabit = null;
    $scope.calendarId = null;
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

    $scope.openStatsDialog = function (event) {
        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'stats.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: 'statsCtrl'
        });
    };

    $scope.closeDialog = function()
    {
        $mdDialog.hide('');
    };

    $scope.initialiseCalendar();
});

