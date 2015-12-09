
angular.module('dailyHabits').controller('statsCtrl', function ($scope, localStorageService) {
    $scope.stats = {period: 0};
    $scope.habits = [];
    $scope.graphData = [];
    $scope.graphOptions = {
        chart: {
            type: 'pieChart',
            height: 500,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.y;
            },
            showLabels: true,
            duration: 100,
            labelThreshold: 0.01,
            deepWatchData: true,
            tooltip: true,
            deepWatchDataDepth: 0,
            labelSunbeamLayout: true,
            legend: {
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };

    $scope.updateGraph = function () {
        var start = null;
        var end = null;

        if ($scope.stats.period == 0) {
            start = moment().subtract(7, 'days');
            end = moment();
        }
        else if ($scope.stats.period == 1) {
            start = moment().subtract(1, 'month');
            end = moment();
        }
        else if ($scope.stats.period == 2) {
            start = moment().subtract(1, 'year');
            end = moment();
        }

        $scope.client.findEvents($scope.calendarId, start.toDate(), end.toDate()).then(function (data) {
            var yes = 0;
            var no = 0;

            for (var i = 0; i < data.length; i++) {
                var event = data[i];

                if (event.habitId == $scope.stats.habitId) {
                    if (event.todo == true) {
                        yes++;
                    }
                    else {
                        no++;
                    }
                }
            }

            $scope.graphData.length = 0;
            $scope.graphData.push({key: "Yes (" + yes + ")", y: yes});
            $scope.graphData.push({key: "No (" + no + ")", y: no});
        });
    };

    $scope.updateHabitDropdownData = function () {
        var keys = localStorageService.keys();
        $scope.habits.length = 0;

        for (var i = 0; i < keys.length; i++) {
            var item = localStorageService.get(keys[i]);
            if (item.hasOwnProperty('habitId')) {
                $scope.habits.push(item);
            }
        }

        if ($scope.habits.length > 0) {
            $scope.stats.habitId = $scope.habits[0].habitId;
        }
    };

    $scope.updateHabitDropdownData();
    $scope.updateGraph();
});