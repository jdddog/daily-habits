var dailyHabits = angular.module('dailyHabits', []);

dailyHabits.controller('mainCtrl', function ($scope) {
    $scope.client = new DiaryClient("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI1NzQ1MDgsImVtYWlsIjoiIiwidXNlcm5hbWUiOiJqZGlwMDA0QGF1Y2tsYW5kLmFjLm56IiwidXNlcl9pZCI6Mywib3JpZ19pYXQiOjE0NTI1NzQyMDh9.NYY5hvbhnzdSGez6MTKaD1Yb1VL3YS1IwXn-UkF2hGA");    $scope.calendarId = null;

    $scope.initialiseCalendar = function () {
        $scope.client.addCalendar("Daily Habits").then(function (data) {
            $scope.calendarId = data.id;
            $scope.$apply();
        }).catch(function (error) {
            console.log(JSON.stringify(error));
        });
    };

    $scope.initialiseCalendar();
});

