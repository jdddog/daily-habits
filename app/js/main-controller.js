var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'LocalStorageModule']);

dailyHabits.controller('mainCtrl', function ($scope, localStorageService) {
    $scope.client = new DiaryClient("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI1NzQ1MDgsImVtYWlsIjoiIiwidXNlcm5hbWUiOiJqZGlwMDA0QGF1Y2tsYW5kLmFjLm56IiwidXNlcl9pZCI6Mywib3JpZ19pYXQiOjE0NTI1NzQyMDh9.NYY5hvbhnzdSGez6MTKaD1Yb1VL3YS1IwXn-UkF2hGA");    $scope.calendarId = null;
    $scope.events = [];

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

    $scope.initialiseCalendar();
});