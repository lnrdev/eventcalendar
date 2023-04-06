<?php
class Calendar{
    //Establish the connection to the database
    //Declare a private property to store the PHP Data Object(PDO) and PDO Statement object
    private $pdo = null;
    private $stmnt = null;
    public $error = "";
    //This function will establish a connection with the database
    function __construct () {
        $this->pdo = new PDO(
            // Mysql host.
            "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
        DB_USER, DB_PASSWORD, [
            //ERRMODE will control how the errors the PDO object encounters are dealt
            //ERRMODE_EXCEPTION will tell the PDO to throw an exception object using the built-in PDOException class if there is an error.
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            //DEFAULT_FETCH_MODE will tell the PDO how to make each row of a result set available.
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }
    //Disconnect from the database
    function __destruct () {
        if($this->stmnt!==null) { $this->stmnt = null; }
        if($this->pdo!==null) {$this->pdo = null;}
    }
    //Running the SQL Query
    function query($sql, $eventData=null){
        //Prepare SQL statement using PDO extension

        $this->stmnt = $this->pdo->prepare($sql);
        $this->stmnt->execute($eventData);
    }
    //Save the events into the calendar
    function save ($startDate, $lastDate, $txt, $txtColor, $background, $id=null){
        //Checks the beginning date and final date of the event
        if (strtotime($lastDate) < strtotime($startDate)) {
            $this->error="The last date can't be earlier than the start date";
            return false;
        }
        //Run the SQL
        // Creates a SQL command for updating an event calendar.
        if($id==null) {
            // Inserts a new event into the calendar.
            $sql = "INSERT INTO `calevents`(`start_date_event`,`last_date_event`,`event_details`,`event_color`,`event_background`)VALUES(?,?,?,?,?)";
            $eventData = [$startDate, $lastDate, strip_tags($txt), $txtColor, $background];
            // Update the start and last date of the event.
        } else {
            $sql= "UPDATE `calevents` SET `start_date_event`=?, `last_date_event`=?, `event_details`=?, `event_color`=?, `event_background`=? WHERE `event_id`=?";
            $eventData = [$startDate, $lastDate, strip_tags($txt), $txtColor, $background, $id];
        }
        $this->query($sql, $eventData);
        return true;
    }
    //This function will delete the events
    function del ($id){
        
        $this->query("DELETE FROM `calevents` WHERE `event_id`=?", [$id]);
        return true;
    }
    //Obtain the events for the selected Month and Year
    function get($month, $year){
        //Calculations for the Date Range
        $month = $month<10 ? "0$month" : $month;
        $daysInTheMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $dateforYandM = "{$year}-{$month}-";
        $startDate = $dateforYandM . "01 00:00:00";
        $lastDate = $dateforYandM . $daysInTheMonth . " 23:59:59";

    //Obtain the events
    // s & l : start and last date of the event
    // c & bgcolor : text color of the detailed event and background color
    //t : text of the detailed event
    
    //Executes the SQL query to select events from the calendar table that overlap within a given date range.
    $this->query("SELECT * FROM `calevents` WHERE (
    (`start_date_event` BETWEEN ? AND ?)
    OR(`last_date_event` BETWEEN ? AND ?) 
    OR (`start_date_event` <= ? AND `last_date_event` >= ?)
    )", [$startDate, $lastDate, $startDate, $lastDate, $startDate, $lastDate]);
    $events = [];

    //Loop through the result set of the prepared statement and fetch each row as an associative array.
    while ($r = $this->stmnt->fetch()) {
        $events[$r["event_id"]] = [
            "s" => $r["start_date_event"], "l" => $r["last_date_event"],
            "c" => $r["event_color"], "bgcolor" => $r["event_background"],
            "t" => $r["event_details"]
        ];
    }
    //Displays the results
    return count($events)==0 ? false : $events;
    }
}
//Settings of the Database
define("DB_HOST", "localhost");
define("DB_NAME", "eventcalendar");
define("DB_CHARSET","utf8mb4");
define("DB_USER", "root");
define("DB_PASSWORD", "");

//Object for new calendar
$_CAL = new Calendar();
