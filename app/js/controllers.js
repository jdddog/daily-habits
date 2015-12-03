//TODO: import libraries with require js

var dailyHabits = angular.module('dailyHabits', ['ngMaterial', 'checklist-model', 'LocalStorageModule', 'nvd3']);

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var client = new UoACalendarClient("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnX2lhdCI6MTQyMjQ5ODk0OSwiZXhwIjoxNDIyNDk5MjQ5LCJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImRldmVsb3BlciIsImVtYWlsIjoidGVzdEBhdWNrbGFuZC5hYy5ueiJ9.7jLkEBovT2HvT2noL4xdIhddaY8wpZpEVYEDHnnNm1Y");

dailyHabits.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('dailyHabits');
});

dailyHabits.directive('input', [function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            if (
                'undefined' !== typeof attrs.type
                && 'number' === attrs.type
                && ngModel
            ) {
                ngModel.$formatters.push(function(modelValue) {
                    return Number(modelValue);
                });

                ngModel.$parsers.push(function(viewValue) {
                    return Number(viewValue);
                });
            }
        }
    }
}]);

dailyHabits.controller('dailyHabitsCtrl', function ($scope, $mdSidenav, $mdUtil, $mdDialog, localStorageService, $q) {
    $scope.isEditable = false;
    $scope.events = [];
    $scope.habits = [];
    $scope.stats = {};
    $scope.calendarId = null;
    $scope.selectedHabit = null;
    $scope.weekdayNames = [{id: 0, name: 'Sun', chkList: 5}, {id: 1, name: 'Mon', chkList: 0}, {id: 2, name: 'Tue', chkList: 2}, {id: 3, name: 'Wed', chkList: 4},
                            {id: 4, name: 'Thu', chkList: 6}, {id: 5, name: 'Fri', chkList: 1}, {id: 6, name: 'Sat', chkList: 3}];
    $scope.states = [{type: 1, name: "not more than"}, {type: 2, name: "at least"}, {type: 3, name: "exactly"}];
    $scope.periods = [{type: 1, name: "week"}, {type: 2, name: "fortnight"}, {type: 3, name: "month"}];
    $scope.menuItems = [{name: "Daily View", icon: "ic_event_available_black_48px.svg"}, {
        name: "Statistics",
        icon: "ic_insert_chart_black_48px.svg"
    }];

    $scope.graphOptions = {
        chart: {
            type: 'pieChart',
            height: 500,
            x: function(d){return d.key;},
            y: function(d){return d.y;},
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

    $scope.graphData = [];
    $scope.displayNumberOpt = false;
    $scope.displayWeekDays = false;
    $scope.displayDaysPerPeriod = false;

    $scope.initialiseCalendar = function()
    {
        return $q(function(resolve, reject) {
            var calendarId = localStorageService.get("calendarId");

            if(calendarId == null)
            {
                client.addCalendar("Daily Habits").then(function (args)
                    {
                        $scope.calendarId = args.data.id;
                        localStorageService.set("calendarId", args.data.id);
                        resolve();
                    }).catch(function (args)                    {
                        console.log(JSON.stringify(args.res));
                        console.log(args.data);
                        reject();
                    }
                );
            }
            else
            {
                $scope.calendarId = calendarId;
                resolve();
            }
        });
    };

    $scope.updateGraph = function()
    {
        var start = null;
        var end = null;

        if($scope.stats.period == 0) {
            start = moment().subtract(7, 'days');
            end = moment();
        }
        else if($scope.stats.period == 1)
        {
            start = moment().subtract(1, 'month');
            end = moment();
        }
        else if($scope.stats.period == 2)
        {
            start = moment().subtract(1, 'year');
            end = moment();
        }

        $scope.findEvents($scope.calendarId, start.toDate(), end.toDate()).then(function (args){
            console.log(args.data);

            var data = args.data;
            var yes = 0;
            var no = 0;

            for(var i = 0; i < data.length; i++) {
                var event = data[i];

                if (event.habitId == $scope.stats.habitId) {
                    if (event.type == 'boolean')
                        if (event.todo == true) {
                            yes++;
                        }
                        else {
                            no++;
                        }
                }
                else {
                    if (event.comparitor == 'not more than') {
                        if(event.qty <= event.goalQty)
                        {
                            yes++;
                        }
                        else{
                            no++;
                        }
                    }
                    else if(event.comparitor == 'at least') {
                        if(event.qty >= event.goalQty)
                        {
                            yes++;
                        }
                        else{
                            no++;
                        }
                    }
                    else if(event.comparitor == 'exactly')
                    {
                        if(event.qty == event.goalQty)
                        {
                            yes++;
                        }
                        else{
                            no++;
                        }
                    }
                }
            }

            $scope.graphData.length = 0;
            $scope.graphData.push({key: "Yes (" + yes + ")", y: yes});
            $scope.graphData.push({key: "No (" + no + ")", y: no});
            console.log('yes', yes);
            console.log('no', no);
        });
    };

    $scope.saveHabit = function () {
        if($scope.selectedHabit.hasOwnProperty('habitId'))
        {
            localStorageService.set($scope.selectedHabit.habitId, $scope.selectedHabit);
            $scope.closeDialog();
            $scope.deleteEvents($scope.selectedHabit).then(function(){
                $scope.createEvents($scope.selectedHabit).then(function(){
                    $scope.gotoToday();
                });
            });
        }
        else {
            $scope.selectedHabit.habitId = $scope.generateUUID();
            localStorageService.set($scope.selectedHabit.habitId, $scope.selectedHabit); //TODO: change to calendar api when can store custom fields in calendar
            $scope.closeDialog();
            $scope.createEvents($scope.selectedHabit).then(function(){

                $scope.gotoToday();
            });
        }
    };

    $scope.deleteEvents = function(habit)
    {
        return $q(function(resolve, reject) {
            var currentDate = $scope.getStartOfDay(moment());

            client.findEvents($scope.calendarId, currentDate.toDate(), currentDate.toDate()).then(function (args){
                    var data = args.data;
                    var eventIds = [];
                    for (var i = 0; i < data.length; i++) {
                        var event = data[i];
                        if (habit.habitId == event.habitId && event.start >= currentDate) {
                            eventIds.push(event.id);
                        }
                    }

                    client.deleteEvents($scope.calendarId, eventIds).then(function(args){
                        resolve();
                    }).catch(function(args){
                        resolve();
                    });

                }).catch(function (args) // onError callback
                {
                    console.log(JSON.stringify(args.res));
                    console.log(args.data);
                    reject();
                }
            );
        });
    };

    $scope.createEvents = function(habit) {
        return $q(function(resolve, reject) {

            var currentDate = moment();
            var events = [];

            for (var d = 0; d < habit.numDays; d++) {
                var day = currentDate.day();

                if (habit.when == 'every' || habit.weekdays.indexOf(day) > -1) {
                    events.push({
                        title: habit.name,
                        type: habit.type,
                        qty: 0,
                        comparitor: habit.comparitor,
                        goalQty: habit.goalQty,
                        units: habit.units,
                        verb: habit.verb,
                        start:  currentDate.clone().toDate(),
                        end: currentDate.clone().toDate(),
                        habitId: habit.habitId
                    });
                }

                currentDate.add(1, 'day');
            }

            client.addEvents($scope.calendarId, events).then(function(args){
                resolve();
            }).catch(function(args){
                resolve();
            });
        });
    };

    $scope.closeDialog = function () {
        $mdDialog.hide('');
    };

    $scope.generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    $scope.onMenuClicked = function (item, event) {
        if(item == 'Statistics')
        {
            $scope.updateHabits();
            $scope.toggleMenu();
            $scope.stats.period = 0;
            $scope.updateGraph();
            $mdDialog.show({
                scope: $scope.$new(),
                templateUrl: 'stats.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: event
            });
        }
    };

    $scope.updateHabits = function(){
        var keys = localStorageService.keys();
        //var habits = [];
        $scope.habits.length = 0;

        for(var i = 0; i < keys.length; i++)
        {
            var item = localStorageService.get(keys[i]);
            if(item.hasOwnProperty('habitId'))
            {
                $scope.habits.push(item);
            }
        }

        if($scope.habits.length > 0)
        {
            $scope.stats.habitId = $scope.habits[0].habitId;
        }
    };

    $scope.validateDate = function (date) {
        return date > moment();
    };

    $scope.updateNumDays = function () {
        $scope.selectedHabit.numDays = Math.ceil(moment($scope.selectedHabit.endDate).diff(moment(), 'days', true));
    };

    $scope.updateDate = function () {
        $scope.selectedHabit.endDate = moment().add($scope.selectedHabit.numDays, 'days').toDate();
    };

    $scope.onTrackTypeChange = function () {
        $scope.displayNumberOpt = $scope.selectedHabit.type == 'number';
    };

    $scope.onTrackDaysChange = function () {
        if ($scope.selectedHabit.when == 'some') {
            $scope.displayWeekDays = true;
            $scope.displayDaysPerPeriod = false;
        }
        else if ($scope.selectedHabit.when == 'period') {
            $scope.displayWeekDays = false;
            $scope.displayDaysPerPeriod = true;
        }
        else {
            $scope.displayWeekDays = false;
            $scope.displayDaysPerPeriod = false;
        }
    };

    $scope.toggleMenu = function () {
        var debounce = $mdUtil.debounce(function () {
            $mdSidenav('sideNavLeft')
                .toggle()
                .then(function () {
                    console.log('do some stuff');
                });
        }, 200);

        debounce();
    };

    $scope.showNewHabitPopup = function (event) {
        $scope.selectedHabit = {type: 'boolean', when: 'every'};

        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'habit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event
        });
    };

    $scope.showEditHabitPopup = function(event, habit)
    {
        $scope.selectedHabit = localStorageService.get(habit.habitId);
        $scope.selectedHabit.endDate = new Date($scope.selectedHabit.endDate);

        $mdDialog.show({
            scope: $scope.$new(),
            templateUrl: 'habit.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event
        });
    };

    $scope.getStartOfDay = function (date) {
        return moment([date.year(), date.month(), date.date()]);
    };

    $scope.getEndOfDay = function (date) {
        return moment([date.year(), date.month(), date.date(), 23, 59, 59]);
    };

    $scope.refreshEvents = function () {
        $scope.events.length = 0;

        var weekDayName = $scope.weekdayNames.filter(function (item) {
            return item.id == $scope.displayedDay.day()
        });

        $scope.currentDateStr = weekDayName[0].name + ' ' + $scope.displayedDay.date() + ' ' + monthNames[$scope.displayedDay.month()] + ' ' + $scope.displayedDay.year();
        var begin = $scope.getStartOfDay($scope.displayedDay);
        var end = $scope.getEndOfDay($scope.displayedDay);

        console.log(JSON.stringify(begin));
        console.log(JSON.stringify(end));

        //TODO: make library use moments

        $scope.findEvents($scope.calendarId, begin.toDate(), end.toDate()).then(
            function (args)
            {
                console.log(JSON.stringify(args.data));
                $scope.events = args.data;
            }
        );
    };

    //TODO: remove when findEvents returns events within range
    $scope.findEvents = function(calendarId, begin, end)
    {
        return $q(function(resolve, reject) {
            client.findEvents(calendarId, begin, end).then(function(args){
                var events = [];
                for(var i = 0; i < args.data.length; i++)
                {
                    var event = args.data[i];
                    if(event.start >= begin && event.start <= end)
                    {
                        events.push(event);
                    }
                }
                args.data = events;
                resolve(args);
            }).catch(function(args){
                reject(args);
            });
        });
    };

    $scope.onEventChanged = function (habit) {
        var cleanCopy = angular.copy(habit);
        client.updateEvent($scope.calendarId, habit.id, cleanCopy);
    };

    $scope.gotoToday = function () {
        $scope.displayedDay = moment();
        $scope.refreshEvents();
    };

    $scope.previousDay = function () {
        $scope.displayedDay.subtract(1, 'day');
        $scope.refreshEvents();
    };

    $scope.nextDay = function () {
        $scope.displayedDay.add(1, 'day');
        $scope.refreshEvents();
    };

    $scope.isDayEditable = function () {
        var currentDay = moment();
        var start = $scope.getStartOfDay(currentDay);
        var end = $scope.getEndOfDay(currentDay);
        return start <= $scope.displayedDay && $scope.displayedDay <= end;
    };

    $scope.initialiseCalendar().then(function(){
        $scope.gotoToday();
    });
});