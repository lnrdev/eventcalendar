<?php
//This AJAX handler maps $_POST requests to the library functions of obtain, save, and delete.
if(isset($_POST["req"])){
    //Will load the library
    require "calendar_library.php";
    switch ($_POST["req"]){
        //Obtain the dates & events for the selected period
        case "get":
            echo json_encode($_CAL->get($_POST["month"], $_POST["year"]));
            break;
        //Save the events
        case "save":
            // Echo a calendar save
            echo $_CAL->save(
                // Returns null if not set.
                $_POST["startDate"], $_POST["lastDate"],$_POST["txt"], $_POST["txtColor"], $_POST["background"],
                isset($_POST["id"]) ? $_POST["id"]:null
            ) ? "OK" : $_CAL->error;
            break;
            //Delete the event
            case "delete":
                echo $_CAL->delete($_POST["id"]) ? "OK" : $_CAL->error;
                break;
    }
}
