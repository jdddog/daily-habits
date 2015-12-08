var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'LocalStorageModule']);

dailyHabits.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('dailyHabits');
});

dailyHabits.controller('mainCtrl', function ($scope, localStorageService) {
    $scope.client = new UoACalendarClient("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnX2lhdCI6MTQyMjQ5ODk0OSwiZXhwIjoxNDIyNDk5MjQ5LCJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImRldmVsb3BlciIsImVtYWlsIjoidGVzdEBhdWNrbGFuZC5hYy5ueiJ9.7jLkEBovT2HvT2noL4xdIhddaY8wpZpEVYEDHnnNm1Y");
    $scope.events = [];
    $scope.calendarId = null;

    $scope.initialiseCalendar = function () {
        var calendarId = localStorageService.get("calendarId");

        if (calendarId == null) {
            $scope.client.addCalendar("Daily Habits").then(function (data) {
                $scope.calendarId = data.id;

                var newEvents = [
                    {title: "Run", start: new Date()},
                    {title: "Run", start: new Date()},
                    {title: "Run", start: new Date()}];

                $scope.client.addEvents($scope.calendarId, newEvents).then(function(data) {
                    localStorageService.set("calendarId", $scope.calendarId);
                    $scope.events = data;
                    $scope.$apply();
                });

            }).catch(function (error) {
                console.log(JSON.stringify(error));
            });
        } else {
            $scope.calendarId = calendarId;
            $scope.displayEvents();
        }
    };

    $scope.displayEvents = function() {
        $scope.client.listEvents($scope.calendarId).then(function(data){
            $scope.events = data;
            $scope.$apply();
        });
    };

    $scope.onEventChanged = function (event) {
        var cleanCopy = angular.copy(event);
        $scope.client.updateEvent($scope.calendarId, event.id, cleanCopy);
    };

    $scope.initialiseCalendar();
});