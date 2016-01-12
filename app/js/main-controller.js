var dailyHabits = angular.module('dailyHabits', ['ngMaterial']);

dailyHabits.controller('mainCtrl', function ($scope) {
    $scope.client = new DiaryClient("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI1NzQ1MDgsImVtYWlsIjoiIiwidXNlcm5hbWUiOiJqZGlwMDA0QGF1Y2tsYW5kLmFjLm56IiwidXNlcl9pZCI6Mywib3JpZ19pYXQiOjE0NTI1NzQyMDh9.NYY5hvbhnzdSGez6MTKaD1Yb1VL3YS1IwXn-UkF2hGA");    $scope.calendarId = null;
    $scope.events = [];

    $scope.initialiseCalendar = function () {
        $scope.client.addCalendar("Daily Habits").then(function (data) {
            $scope.calendarId = data.id;

            var events = [
                {title: "Run", start: new Date()},
                {title: "Run", start: new Date()},
                {title: "Run", start: new Date()
            }];

            $scope.client.addEvents($scope.calendarId, events).then(function (data) {
                $scope.events = data;
                $scope.$apply();
            });

        }).catch(function (error) {
            console.log(JSON.stringify(error));
        });
    };

    $scope.initialiseCalendar();
});
