var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'LocalStorageModule']);

dailyHabits.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('dailyHabits');
});

dailyHabits.controller('mainCtrl', function ($scope, localStorageService) {
    $scope.client = new UoACalendarClient("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnX2lhdCI6MTQyMjQ5ODk0OSwiZXhwIjoxNDIyNDk5MjQ5LCJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImRldmVsb3BlciIsImVtYWlsIjoidGVzdEBhdWNrbGFuZC5hYy5ueiJ9.7jLkEBovT2HvT2noL4xdIhddaY8wpZpEVYEDHnnNm1Y");
    $scope.events = [];
    $scope.calendarId = null;
    $scope.displayedDay = moment();

    $scope.initialiseCalendar = function () {
        var calendarId = localStorageService.get("calendarId");

        if (calendarId == null) {
            $scope.client.addCalendar("Daily Habits").then(function (data) {
                $scope.calendarId = data.id;

                var today = moment();
                var ytd = today.clone().subtract(1, 'day');
                var tmr = today.clone().add(1, 'day');

                var newEvents = [
                    {title: "Run", start: today.toDate()},
                    {title: "Run", start: ytd.toDate()},
                    {title: "Run", start: tmr.toDate()}];

                $scope.client.addEvents($scope.calendarId, newEvents).then(function(data) {
                    localStorageService.set("calendarId", $scope.calendarId);
                    $scope.today();
                });

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

    $scope.initialiseCalendar();
});
