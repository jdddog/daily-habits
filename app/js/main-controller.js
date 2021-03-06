var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'nvd3', 'LocalStorageModule']);

dailyHabits.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('dailyHabits');
});

dailyHabits.controller('mainCtrl', function ($scope, $mdUtil, $mdDialog, $q, localStorageService) {
    $scope.client = new DiaryClient("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI1NzQ1MDgsImVtYWlsIjoiIiwidXNlcm5hbWUiOiJqZGlwMDA0QGF1Y2tsYW5kLmFjLm56IiwidXNlcl9pZCI6Mywib3JpZ19pYXQiOjE0NTI1NzQyMDh9.NYY5hvbhnzdSGez6MTKaD1Yb1VL3YS1IwXn-UkF2hGA");
    $scope.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $scope.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.events = [];
    $scope.calendarId = null;
    $scope.selectedHabit = null;

    $scope.initialiseCalendar = function () {
        var calendarId = localStorageService.get("calendarId");

        if (calendarId == null) {
            $scope.client.addCalendar("Daily Habits").then(function (data) {
                $scope.calendarId = data.id;
                localStorageService.set("calendarId", data.id);
                $scope.today();
            }).catch(function (error) {
                console.log(JSON.stringify(error));
            });
        }
        else {
            $scope.calendarId = Number(calendarId);
            $scope.today();
        }
    };

    /*
     * Event functions
     */

    $scope.displayEvents = function () {
        $scope.events.length = 0;

        var dayName = $scope.dayNames.filter(function (item) {
            return item.id == $scope.displayedDay.day()
        });

        $scope.currentDateStr = dayName + ' ' + $scope.displayedDay.date() + ' ' + $scope.monthNames[$scope.displayedDay.month()] + ' ' + $scope.displayedDay.year();
        var begin = $scope.displayedDay.clone().startOf('day');
        var end = $scope.displayedDay.clone().endOf('day');

        $scope.findEvents($scope.calendarId, begin.toDate(), end.toDate()).then(
            function (data) {
                $scope.events = data;
            }
        );
    };

    $scope.onEventChanged = function (habit) {
        var cleanCopy = angular.copy(habit);
        $scope.client.updateEvent($scope.calendarId, habit.id, cleanCopy);
    };

    //TODO: remove when findEvents returns events within range
    $scope.findEvents = function (calendarId, begin, end) {
        return $q(function (resolve, reject) {
            $scope.client.findEvents(calendarId, begin, end).then(function (data) {
                var events = [];
                for (var i = 0; i < data.length; i++) {
                    var event = data[i];
                    if (event.start >= begin && event.start <= end) {
                        events.push(event);
                    }
                }
                data = events;
                resolve(data);
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    /*
     * Dialog functions
     */

    $scope.openStatsDialog = function (event) {
        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'stats.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            controller: 'statsCtrl'
        });
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

    $scope.closeDialog = function () {
        $mdDialog.hide('');
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

    /*
     * Gets or creates calendar and loads events for today.
     */

    $scope.initialiseCalendar();
});

