var calendar = {
    /*The variable calendar is an object that currently 
    contains the basic mechanics of a calendar*/
    monday: false, // The first day in the calendar will be Monday
    calevents: null, //Displays the events data for the current month and year
    selectedMth: 0, selectedYr: 0, //The selected month and year
    htmlMonth: null, htmlYear: null, //HTML for the month and year
    htmlCalDays: null, htmlCalBody: null, //HTML for the body of the calendar and the days 

    //HTML Forms and fields
    htmlFormWrap: null, htmlForm: null, htmlFormId: null,
    htmlFormStartDate: null, htmlFormLastDate: null, htmlFormDetails: null,
    htmlFormColor: null, htmlFormBackground: null, htmlFormDelete: null,

    //A function that will help support for the AJAX fetch
    ajax: (eventData, onload) => {
        //Date for the form
        let form = new FormData();
        for (let [k, v] of Object.entries(eventData)) {
            form.append(k, v);
        }
        //Fetch the ajax
        fetch("ajax_calendar.php", { method: "POST", body: form })
            //this fetch function will call the ajax_calendar.php file.    
            .then(res => res.text())
            .then(txt => onload(txt))
            .catch(err => console.error(err));
    },
    //Initialize the Calendar
    init: () => {
        //Obtain the HTML Elements
        calendar.htmlMonth = document.getElementById("calendarMth");
        calendar.htmlYear = document.getElementById("calendarYear");
        calendar.htmlCalDays = document.getElementById("calendarDays");
        calendar.htmlCalBody = document.getElementById("calendarBody");
        calendar.htmlFormWrap = document.getElementById("calendarForm");
        calendar.htmlForm = calendar.htmlFormWrap.querySelector("form");
        calendar.htmlFormId = document.getElementById("eventID");
        calendar.htmlFormStartDate = document.getElementById("startEventDate");
        calendar.htmlFormLastDate = document.getElementById("lastEventDate");
        calendar.htmlFormDetails = document.getElementById("eventDetails");
        calendar.htmlFormColor = document.getElementById("eventColor");
        calendar.htmlFormBackground = document.getElementById("eventBackground");
        calendar.htmlFormDelete = document.getElementById("eventDelete");
        //Attach Controls
        calendar.htmlMonth.onchange = calendar.load;
        calendar.htmlYear.onchange = calendar.load;
        document.getElementById("calendarBack").onclick = () => calendar.pshift();
        document.getElementById("calendarNext").onclick = () => calendar.pshift(1);
        document.getElementById("calendarAdd").onclick = () => calendar.show();
        calendar.htmlForm.onsubmit = () => calendar.save();
        document.getElementById("closeEvent").onclick = () => calendar.htmlFormWrap.close();
        calendar.htmlFormDelete.onclick = calendar.del();

        //Draws out the letters of the days
        let diebus = ["M", "T", "W", "R", "F", "S"];
        if (calendar.monday) { diebus.push("U"); } else { diebus.unshift("U"); }
        for (let d of diebus) {
            let calCell = document.createElement("div");
            calCell.className = "calendarCell";
            calCell.innerHTML = d;
            calendar.htmlCalDays.appendChild(calCell);
        }
        //Load and Draw the Calendar
        calendar.load();

    },

    //This will shift the current month by 1

    //calendar.initialize will obtain the HTML elements, enabling them and drawing out the letters of the weekdays
    pshift: forward => {
        //This function will be used to drive the buttons for the next month and previous
        //parseInt will convert the string to an integer
        calendar.selectedMth = parseInt(calendar.htmlMonth.value);
        calendar.selectedYr = parseInt(calendar.htmlYear.value);
        if (forward) { calendar.selectedMth++; } else { calendar.selectedMth--; }
        if (calendar.selectedMth > 12) { calendar.selectedMth = 1; calendar.selectedYr++; }
        if (calendar.selectedMth < 1) { calendar.selectedMth = 12; calendar.selectedYr--; }
        calendar.htmlMonth.value = calendar.selectedMth;
        calendar.htmlYear.value = calendar.selectedYr;
        calendar.load();
    },
    //Load the events for the calendar
    load: () => {
        calendar.selectedMth = parseInt(calendar.htmlMonth.value);
        calendar.selectedYr = parseInt(calendar.htmlYear.value);
        calendar.ajax({
            req: "get",
            mth: calendar.selectedMth,
            yr: calendar.selectedYr
        }, calevents => {
            calendar.calevents = JSON.parse(calevents);
            calendar.draw();
        });
    },
    //Draw the calendar
    //The draw calendar function aquires the data from the ajax_calendar.php
    draw: () => {
        //Calculates the month, day, and year
        //January is 0 & Dec is 11
        //Sunday is 0 & Saturday is 6
        let daysInTheMonth = new Date(calendar.selectedYr, calendar.selectedMth, 0).getDate(), //The number of days
            strtDay = new Date(calendar.selectedYr, calendar.selectedMth - 1, 1).getDay(), //the first day of the month
            lastDay = new Date(calendar.selectedYr, calendar.selectedMth - 1, daysInTheMonth).getDay(), // the last day of the month
            present = new Date(), // the current date
            presentMonth = present.getMonth() + 1, // the current month
            presentYr = parseInt(present.getFullYear()),//the current year
            presentDay = calendar.selectedMth == presentMonth && calendar.selectedYr == presentYr ? present.getDate() : null;

        //Draw the rows and cells for the calendar
        //Initialize the functions
        let calRowA, calRowB, calRowC, calRowMap = {}, calRowNum = 1,
            calCell, calCellNum = 1,

            rows = () => {
                calRowA = document.createElement("div");
                calRowB = document.createElement("div");
                calRowC = document.createElement("div");
                calRowA.className = "calendarRow";
                calRowA.id = "calendarRow" + calRowNum;
                calRowB.className = "calendarRowHead";
                calRowC.className = "calendarRowBack";
                calendar.htmlCalBody.appendChild(calRowA);
                calRowA.appendChild(calRowB);
                calRowA.appendChild(calRowC);
            },
            cells = day => {
                calCell = document.createElement("div");
                calCell.className = "calendarCell";
                if (day) { calCell.innerHTML = day; }
                calRowB.appendChild(calCell);
                calCell = document.createElement("div");
                calCell.className = "calendarCell";
                if (day === undefined) { calCell.classList.add('calendarBlank'); }
                if (day !== undefined && day == presentDay) { calCell.classList.add("calendarToday"); }
                calRowC.appendChild(calCell);
            };
        calendar.htmlCalBody.innerHTML = ""; rows();
        //Displays blank cells before the start of the month
        if (calendar.monday && strtDay != 1) {
            let blankCells = strtDay == 0 ? 7 : strtDay;
            for (let i = 1; i < blankCells; i++) { cells(); calCellNum++; }
        }
        if (!calendar.monday && strtDay != 0) {
            for (let i = 0; i < strtDay; i++) { cells(); calCellNum++ }
        }
        //The days of the month
        //Loop through the days of the month and create a cell for each day
        for (let i = 1; i <= daysInTheMonth; i++) {
            //Store the row and column number of each cell in a map
            calRowMap[i] = { r: calRowNum, c: calCellNum };
            cells(i);
            //If the end of the week is reached and it is not the last day. Create a new row.
            if (i != daysInTheMonth && calCellNum % 7 == 0) { calRowNum++; rows(); }
            calCellNum++;
        }
        //Displays the blank cells after the end of the month
        //If the calendar starts on Monday, check the last day of the month
        if (calendar.monday && lastDay != 0) {
            //Fill the remaining cells of the last row with blanks
            let blankCells = lastDay == 6 ? 1 : 7 - lastDay;
            for (let i = 0; i < blankCells; i++) { cells(); calCellNum++; }
        }
        if (!calendar.monday && lastDay != 6) {
            let blankCells = lastDay == 0 ? 6 : 6 - lastDay;
            for (let i = 0; i < blankCells; i++) { cells(); calCellNum++; }
        }
        //Draw the events into the calendar
        if (calendar.calevents !== false) {
            for (let [id, evt] of Object.entries(calendar.calevents)) {
                //Displays the start day of the event and the last day
                let strt = new Date(evt.s), ld = new Date(evt.l);
                if (strt.getFullYear() != calendar.selectedYr) { strt = 1; }
                else { strt = strt.getMonth() + 1 < calendar.selectedMth ? 1 : strt.getDate(); }
                if (ld.getFullYear() != calendar.selectedYr) { ld = daysInTheMonth; }
                else { ld = ld.getMonth() + 1 > calendar.selectedMth ? daysInTheMonth : ld.getDate(); }

                //Map onto the HTML Calendar
                calCell = {}; calRowNum = 0;
                for (let i = strt; i <= ld; i++) {
                    if (calRowNum != calRowMap[i]["r"]) {
                        calCell[calRowMap[i]["r"]] = { s: calRowMap[i]["c"], l: 0 };
                        calRowNum = calRowMap[i]["r"];
                    }
                    if (calCell[calRowNum]) { calCell[calRowNum]["l"] = calRowMap[i]["c"]; }
                }
                //Draw the row for the HTML Event
                for (let [r, c] of Object.entries(calCell)) {
                    let o = c.s - 1 - ((r - 1) * 7),//Offset of the event cell
                        w = c.l - c.s + 1; //width of the event cell
                    calRowA = document.getElementById("calendarRow" + r);
                    calRowB = document.createElement("div");
                    calRowB.className = "calendarRowEvent";
                    calRowB.innerHTML = calendar.calevents[id]["t"];//text details
                    calRowB.style.color = calendar.calevents[id]["c"];//color
                    calRowB.style.backgroundColor = calendar.calevents[id]["b"];//background
                    calRowB.classList.add("w" + w);
                    if (o != 0) { calRowB.classList.add("o" + o); }
                    calRowB.onclick = () => calendar.show(id);
                    calRowA.appendChild(calRowB);
                }
            }
        }
    },
    //Display the event form
    //calendar.show() will display the add and edit event form for the calendar
    show: id => {
        if (id) {
            calendar.htmlFormId.value = id;
            calendar.htmlFormStartDate.value = calendar.calevents[id]["s"].replace(" ", "T").substring(0, 16);
            calendar.htmlFormLastDate.value = calendar.calevents[id]["l"].replace(" ", "T").substring(0, 16);
            calendar.htmlFormDetails.value = calendar.calevents[id]["t"];
            calendar.htmlFormColor.value = calendar.calevents[id]["c"];
            calendar.htmlFormBackground.value = calendar.calevents[id]["b"];
            calendar.htmlFormDelete.style.display = "inline-block";
        } else {
            calendar.htmlForm.reset();
            calendar.htmlFormId.value = "";
            calendar.htmlFormDelete.style.display = "none";
        }
        calendar.htmlFormWrap.show();
    },
    // Save the events
    //calendar.save() will save the events of the calendar
    save: () => {
        //Collect the saved data
        var calendarData = {
            req: "save",
            start: calendar.htmlFormStartDate.value,
            last: calendar.htmlFormLastDate.value,
            details: calendar.htmlFormDetails.value,
            color: calendar.htmlFormColor.value,
            bgcolor: calendar.htmlFormBackground.value
        };
        if (calendar.htmlFormId.value != "") { calendarData.id = calendar.htmlFormId.value; }

        //Checking the dates
        if (new Date(calendarData.start) > new Date(calendarData.last)) {
            alert("The start date of the event can't be later than the last date of the event!");
            return false;
        }
        //Ajax Save
        calendar.ajax(calendarData, res => {
            if (res == "OK") {
                calendar.htmlFormWrap.close();
                calendar.load();
            } else { alert(res); }
        });
        return false;
    },
    //Delete the event
    //calendar.delete() will delete the events from the calendar
    del: () => {
        if (confirm("Would you like to delete the event?")) {
            calendar.ajax({
                req: "del", id: calendar.htmlFormId.value
            }, res => {
                if (res == "OK") {
                    calendar.htmlFormWrap.close();
                    calendar.load();
                } else { alert(res); }
            });
        }
    }
};
window.onload = calendar.init;