var dailyHabits = angular.module('dailyHabits', []);

dailyHabits.controller('mainCtrl', function ($scope) {
    $scope.client = new DiaryClient("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnX2lhdCI6MTQyMjQ5ODk0OSwiZXhwIjoxNDIyNDk5MjQ5LCJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImRldmVsb3BlciIsImVtYWlsIjoidGVzdEBhdWNrbGFuZC5hYy5ueiJ9.7jLkEBovT2HvT2noL4xdIhddaY8wpZpEVYEDHnnNm1Y");
    $scope.calendarId = null;

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

