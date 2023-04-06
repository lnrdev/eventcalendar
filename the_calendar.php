<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Florida Historical Society Event Calendar</title>
<!--JavaScript and CSS-->
<script src="calendar.js"></script>
<link rel="stylesheet" href="calendar_style.css">
</head>
<body>
<?php    
// Returns an array of the months
$mths = [
    1 => "January", 2 => "February", 3 => "March", 4 => "April",
    5 => "May", 6 => "June", 7 => "July", 8 => "August",
    9 => "September", 10 => "October", 11 => "November", 12 => "December"
];
// Sets the current month and current year
$currentMonth = date("m");
$currentYear = date("Y"); ?>
<!--Month Selector-->
<div id="calendarHead">
    <!--The Month and Year Selector for the calendar-->
    <div id="calendarMonth">
        <input  id="calendarBack" type="button" class="mi" value="&lt;">
        <select id="calendarMth"><?php foreach ($mths as $m=>$mth){
            // Prints out the selected option for the current month
            printf("<option value='%u'%s>%s</option>", 
            $m, $m==$currentMonth?" selected":"", $mth);
        }?></select>
        <input id="calendarYear" type="number"  value="<?=$currentYear?>">
        <input id="calendarNext" type="button"  class="mi" value="&gt;">
    </div>
    <input id="calendarAdd" type="button"  value="+">
    </div>
    <!--Calendar Wrapper-->
    <!--The HTML of the calendar will be generated with JavaScript-->
    <div id="calendarWrap">
        <div id="calendarDays"></div>
        <div id="calendarBody"></div>
    </div>
    <!--Event Form Dialog Box-->
    <dialog id="calendarForm">
        <!--The form will display a hidden popup dialog box to either add or update an event-->
        <form method="dialog">
            <div id="closeEvent">X</div>
            <h2 class="event1">EVENT CALENDAR</h2>
            <div class="event2">
                <label>Start Date</label>
                <input id="startEventDate" type="datetime-local"  required>
            </div>
            <div class="event2">
                <label>Last Date</label>
                <input id="lastEventDate" type="datetime-local"  required>
            </div>
            <div class="event2">
                <label>Text Color</label>
                <input id="eventColor" type="color"  value="#000000" required>
            </div>
            <div class="event2">
                <label>Background Color</label>
                <input id="eventBackground" type="color"  value="#ffdbdb" required>
            </div>
            <div class="event1">
                <label>Event</label>
                <input id="eventDetails" type="text" required>
            </div>
            <div class="event1">
                <input type="hidden" id="eventID">
                <input type="button" id="eventDelete" value="Delete Event">
                <input type="submit" id="eventSave" value="Save Event">
            </div>
    </form></dialog>
    </body>
</html>
