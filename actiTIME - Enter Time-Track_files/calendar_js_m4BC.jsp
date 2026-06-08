


/**
* Calendar
*
* To get the selected value you have to define callback function
* with only one argument - string representing a date. You can use
* strToDate() to get Date object from this string.
*
* Based on showCalendar() function by Denis Gritcyuk <denis@softcomplex.com>
*
* @author       Dmitry Prokudin <dmitry@actimind.com>
*
* @access       public
* @version      1.0
*/

function getPopupCalendar(strDateTime, today, yearFrom, yearTo, callbackFunc, weekStartDay, invertedDays)
{
    var yearFromStr = "";
    var yearToStr = "";
    if (yearFrom != null && yearFrom != "" && yearTo != null && yearTo != "")
    {
        yearFromStr = yearFrom+"-1-1";
        yearToStr = yearTo+"-12-31";
    }

    cal = new Calendar(strDateTime, today, yearFromStr, yearToStr, "", "", callbackFunc, true, weekStartDay, invertedDays);

    cal.setWeekDays(new Array("S", "M", "T", "W", "T", "F", "S"));

    return cal;
}

/**
* Calendar
*
* To get the selected value you have to define callback function
* with only one argument - string representing a date. You can use
* strToDate() to get Date object from this string.
*
* Based on showCalendar() function by Denis Gritcyuk <denis@softcomplex.com>
*/
function printLayoutCalendar(strDateTime, today, startFrameDate, endFrameDate, callbackFunc, weekStartDay, invertedDays)
{
    cal = createLayoutCalendar(strDateTime, today, startFrameDate, endFrameDate, callbackFunc, weekStartDay, invertedDays);
    document.writeln(cal.getCalendarHTML());
}

function createLayoutCalendar(strDateTime, today, startFrameDate, endFrameDate, callbackFunc, weekStartDay, invertedDays)
{
    return new Calendar(strDateTime, today, "", "", startFrameDate, endFrameDate, callbackFunc, false, weekStartDay, invertedDays);
}

function createBorderHighlightingLayoutCalendar(strDateTime, today, startFrameDate, endFrameDate, callbackFunc, weekStartDay, invertedDays)
{
    var calendar =  new Calendar(strDateTime, today, "", "", startFrameDate, endFrameDate, callbackFunc, false, weekStartDay, invertedDays);
    calendar.highliteFrame = true;
    calendar.changeMonthIfDateOutsideCurrentMonth = false;
    var frame;
    var highLitedTR;
    var calendarTable, headerHeight, trHeight, tablePos;
    var framedTR, framedTRColor, framedTRColor1 = Calendar_currentWeek_hiColorLighter, frameHeight;
    var userAgent = navigator.userAgent;
    var appName = navigator.appName;

    function getFrame() {
        if(frame == null) {
            frame = document.getElementById("calendar_frame");
            var t =  document.getElementById("calendar_row_1");
            frame.style.padding = '1 1 1 1';
            frame.style.width = t.offsetWidth;
            frame.style.height = t.offsetHeight;
            var img = document.getElementById('calendar_frame_image');
            img.style.width = parseInt(t.offsetWidth, 10);
            //img.style.height = parseInt(t.offsetHeight, 10) - 1;
            img.style.height = parseInt(t.offsetHeight, 10) - 1;
            if(navigator.appName.toLowerCase() == "microsoft internet explorer"
                && navigator.userAgent.toLowerCase().indexOf("opera") == -1) {
                frame.childNodes[0].style.width = parseInt(img.style.width) - 8;
                frame.style.width = parseInt(img.style.width) - 8;
                frame.childNodes[0].style.height = parseInt(img.style.height) - 5;
                frame.style.height = parseInt(img.style.height) - 6;
            } else if(navigator.userAgent.toLowerCase().indexOf("mozilla") != -1
                && navigator.userAgent.toLowerCase().indexOf("opera") == -1) {
                frame.childNodes[0].style.width = parseInt(img.style.width, 10) - 3;
                frame.style.width = parseInt(img.style.width, 10) - 3;
                frame.childNodes[0].style.height = parseInt(img.style.height) - 2;
                frame.style.height = parseInt(img.style.height) - 3;
            } else {
                frame.childNodes[0].style.width = parseInt(img.style.width) - 1;
                frame.style.width = parseInt(img.style.width) - 1;
                frame.childNodes[0].style.height = parseInt(img.style.height) - 5;
                frame.style.height = parseInt(img.style.height) - 6;
            }
            frameHeight = img.style.height;
            function onFrameClick(e) {
                var trNumber = validTrNumber(e);
                if(trNumber == null ){
                    return;
                }
                document.getElementById("calendar_row_" + (trNumber + 1)).childNodes[0].onclick(e);
            }
            function onMouseOut(e){
                if(!isInCalendarTable(e)){
                    unhighliteTR();
                    setBorderColor(getFramedTR(), framedTRColor);
                } else {
                    updateFramePos(e);
                }
                //updateFramePos(e);
            }
            if(window.event){
                frame.onclick = function () {
                    onFrameClick(window.event);
                }
                frame.onmouseout = function(){
                    onMouseOut(window.event);
                }
            } else if (frame.addEventListener) {
                frame.addEventListener('click',onFrameClick, false );
                frame.addEventListener('mouseout',onMouseOut, false );
            }

        }
        return frame;
    }

    function getElementPosition(offsetTrail) {
        var offsetLeft = 0;
        var offsetTop = 0;
        while (offsetTrail) {
            offsetLeft += offsetTrail.offsetLeft;
            offsetTop += offsetTrail.offsetTop;
            offsetTrail = offsetTrail.offsetParent;
        }
        if (navigator.userAgent.indexOf("Mac") != -1 &&
            typeof document.body.leftMargin != "undefined") {
            offsetLeft += document.body.leftMargin;
            offsetTop += document.body.topMargin;
        }
        return {left:offsetLeft, top:offsetTop};
    }

    function getCalendarTable() {
        if(calendarTable == null) {
            calendarTable = document.getElementById("calendar_table");
            if(window.event){
                calendarTable.onmousemove = function (event) {
                    updateFramePos(event ? event : window.event);
                }
                /*calendarTable.onmouseout = function () {
                    updateFramePos(window.event);
                }
                calendarTable.onmouseover = function () {
                    updateFramePos(window.event);
                }*/
            } else if (calendarTable.addEventListener) {
                calendarTable.addEventListener('mousemove',updateFramePos, false );
                /*calendarTable.addEventListener('mouseout',updateFramePos, false );
                calendarTable.addEventListener('mouseover',updateFramePos, false );*/
            }

            headerHeight = document.getElementById("calendar_row_0").offsetHeight;
            trHeight = document.getElementById("calendar_row_1").offsetHeight;
        }
        tablePos = getElementPosition(calendarTable);
        //window.status = "x " + tablePos.left + " y = " + tablePos.top;
        return {table:calendarTable, pos:tablePos};
    }

    function highliteTR(tr)
    {
        var trPos = getElementPosition(tr);
        var frameX = trPos.left - 1;//getCalendarTable().pos.left;
        var frameY = trPos.top;
        if( (appName.toLowerCase() == "microsoft internet explorer"
            || userAgent.toLowerCase().indexOf("mozilla") != -1)
            && userAgent.toLowerCase().indexOf("opera") == -1) {
            getFrame().style.left = frameX + 1;
            getFrame().style.top = frameY;
        } else {
            getFrame().style.left = frameX + 2;
            getFrame().style.top = frameY;
        }
        getFrame().style.display = 'block';
        highLitedTR = tr;
        setBorderColor(getFramedTR(), framedTRColor1);
    }

    function unhighliteTR()
    {
        getFrame().style.display = 'none';
        highLitedTR = null;
    }

    /*
    * Returns current coordinates of mouse pointer.
    *
    * In some cases it is possible for "event" object, passed as a function parameter,
    * to be of undefined type. Particularly this situation occurs in "Mozilla Firefox"
    * browser while page containing the calendar is being loaded. If user performs some
    * action on the calendar (such as moving mouse pointer) while the rest of the page
    * has not been loaded calendar's event handlers receive "event" object of undefined
    * type. In this situation function returns negative values for coordinates (-1) to
    * report the condition. For example callers of this function "calcTrNumber" and
    * "isInCalendarTable" functions will respond by returning "null" and "false" values
    * consequently (these are the values expected by subsequent callers).
    */
    function getClientCoordinates(e){

        // By default variables have error values
        var posx = -1, posy = -1;

        // If not event object is not of undefined type get coordinate values
        if(typeof e != typeof undefined){

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft;
                posy = e.clientY + document.body.scrollTop;
            }
        }

        return  {x:posx, y:posy};
    }


    function calcTrNumber(e)
    {
        var clientXY = getClientCoordinates(e);
        var tablePosy = getCalendarTable().pos.top;
        var trNumber = ((clientXY.y - tablePosy) - headerHeight )/trHeight;
        //window.status = ' trNUmber:' + trNumber;
        if(trNumber < 0) return null;
        trNumber = parseInt(trNumber, 10);
        return trNumber
    }

    function getTRCount(){
        return calendar.weeksCount;
    }

    function validTrNumber(e){
        var trNumber = calcTrNumber(e);
        if(trNumber == null){
            return null;
        }
        var trCount = getTRCount();
        //window.status = 'trN:' + trNumber + ' trC:' + trCount;
        trCount -= 2; //substract header row and make trNumber start with 0
        if(trNumber > trCount){
            if(trNumber - trCount > 1)
                return null;
            trNumber = trCount;
        }
        return trNumber
    }

    function updateFramePos(e){
        var trNumber = validTrNumber(e);
        if(trNumber == null ){
            unhighliteTR();
            return;
        }
        var tr = document.getElementById("calendar_row_" + (trNumber + 1));
        if (tr) {
            if ( highLitedTR != null && tr.getAttribute("id") == highLitedTR.getAttribute("id")) return;
            highliteTR(tr);
        }
    }

    Calendar_highlightCell = function(tr, event)
    {
        updateFramePos(event);
    }

    Calendar_unhighlightCell = function(tr, e)
    {
        if(!isInCalendarTable(e)) {
            unhighliteTR();
            var frameTR = getFramedTR();
            setBorderColor(frameTR, framedTRColor);
        }
    }

    function isInCalendarTable(e) {
        var clientXY = getClientCoordinates(e);
        var tableInfo = getCalendarTable();
        var table = tableInfo.table;
        var tableX = tableInfo.pos.left;
        var tableY = tableInfo.pos.top + headerHeight;
        var tableWidth = table.offsetWidth;
        var tableHeight = table.offsetHeight;
        tableHeight -= headerHeight;
        return clientXY.x > tableX && clientXY.x < (tableX + tableWidth)
                && clientXY.y > tableY && clientXY.y < (tableY + tableHeight);
    }

    function getFramedTR(){
        if(framedTR == null){
            var trCount = getTRCount();
            for(var i = 0; i < trCount; ++i){
                var tr = document.getElementById("calendar_row_" + i);
                if(tr != null) {
                    if(tr.childNodes[0].id == "Calendar_frameElement" ){
                        framedTR = tr;
                        framedTRColor = framedTR.childNodes[0].style.borderLeftColor;
                        return tr;
                    }
                }
            }
        }
        return framedTR;
    }

    function setBorderColor(tr, color){
        tr.childNodes[0].style.borderLeftColor = color;
        for(var i = 0; i < 7; ++i){
            tr.childNodes[i].style.borderTopColor = color;
            tr.childNodes[i].style.borderBottomColor = color;
        }
        tr.childNodes[6].style.borderRightColor = color;
    }

    Calendar_calendarTableOut = function(e)
    {
       if(isInCalendarTable(e)) {
            updateFramePos(e);
        } else  {
            unhighliteTR();
            var frameTR = getFramedTR();
            setBorderColor(frameTR, framedTRColor);
        }
    }

    Calendar_calendarTableOver = function(e, table)
    {
        if(isInCalendarTable(e)){
            updateFramePos(e);
            var frameTR = getFramedTR();
        }
    }

    return calendar;
}

var Calendar_calendarTableOut = function (table) {
 //default handler do nothing
}

var Calendar_calendarTableOver = function (table) {
 //default handler do nothing
}
//////////////////////////////////////////////////////////////////////////
////////////////////////////   Calendar class   //////////////////////////
//////////////////////////////////////////////////////////////////////////

// Note: "weekStartDay" parameter can take values starting from 1 (sunday) to 7 (saturday) in order to comply
// with java.util.Calendar class. But "weekStartDay" property of the object is assigned to the parameter - 1 value
// since all calculations in class methods rely on value between 0 and 6
function Calendar(strDateTime, today, startDate, endDate, startFrameDate, endFrameDate, callbackFunc, inPopup, weekStartDay, invertedDays)
{
    // init properties
    this.weekDays  = new Array();
    this.arrMonths = new Array();

    if(invertedDays != '' && invertedDays != null)
        this.invertedDays = invertedDays;
    else
        this.invertedDays = new Array();

    this.callbackFunc = callbackFunc;
    this.inPopup = inPopup;
    this.onmouseOverHandler = "Calendar_highlightCell(this, event)";
    this.onmouseOutHandler = "Calendar_unhighlightCell(this, event)";

    this.months = new Array("January", "February", "March",     "April",   "May",      "June",
                            "July",    "August",   "September", "October", "November", "December");

    this.weekStartDay = (weekStartDay - 1); // Property value should be 0 based (see note above)
    this.weekDays = new Array("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa");

    this.today = strToDate(today);

    this.baseDate = strDateTime == null || strDateTime == "" ?  this.today : strToDate(strDateTime);
    this.startDate = null;
    this.endDate = null;
    if(startDate != null && startDate != "" && endDate != null && endDate != "")
    {
        this.startDate = strToDate(startDate);
        this.endDate = strToDate(endDate);
    }
    this.startFrameDate = null;
    this.endFrameDate = null;
    if(startFrameDate != null && startFrameDate != "" && endFrameDate != null && endFrameDate != "")
    {
        this.startFrameDate = strToDate(startFrameDate);
        this.endFrameDate = strToDate(endFrameDate);
    }

    this.prevMonth = new Date(this.baseDate);
    this.prevMonth.setMonth(this.baseDate.getMonth() - 1);

    this.nextMonth = new Date(this.baseDate);
    this.nextMonth.setMonth(this.baseDate.getMonth() + 1);

    this.firstDay = new Date(this.baseDate);
    this.firstDay.setDate(1);
    this.firstDay.setDate(1 - (7 + this.firstDay.getDay() - this.weekStartDay) % 7);

    this.lastDay = new Date(this.nextMonth);
    this.lastDay.setDate(0);

    this.hilightCurrentDay = true;
    this.linkCurrentDay = true;
    this.header = false;

    this.setStyleNames("calendarWorkingDay", "calendarWeekendDay", "calendarCurrentDay");

    this.changeMonthIfDateOutsideCurrentMonth = true;
    this.displayDaysOfOtherMonths = true; 
}

Calendar.prototype.setMouseOverHandler =
function Calendar_setMouseOverHandler(func) {
    this.onmouseOverHandler = func;
}

Calendar.prototype.setMouseOutHandler =
function Calendar_setMouseOutHandler(func) {
    this.onmouseOutHandler = func;
}


var Calendar_hiColor = '#face00';
var Calendar_currentWeek_hiColor = '#face00';
var Calendar_currentWeek_hiColorLighter = '#ffe980';
var Calendar_currentDayColor = '#fff8da';
var Calendar_workingDayColor = '#ffffff';
var Calendar_weekendDayColor = '#f1f5fa';

function Calendar_isWeekend(cell)
{
    var span = cell.firstChild;
    if(span && span.nodeName == 'SPAN')
    {
        return span.className.indexOf('Weekend') != -1;
    }
    return cell.className == 'calendarWeekendDay';
}

Calendar.prototype.isWeekend = Calendar_isWeekend;

function Calendar_isCurrentDay(cell) {
    return cell.className == 'calendarCurrentDay';
}

var Calendar_highlightCell = function(cell)
{
    cell.style.backgroundColor = Calendar_hiColor;
    try { cell.style.cursor = 'pointer'; } catch (e) {}
}

var Calendar_unhighlightCell = function(cell)
{
    try { cell.style.cursor = ''; } catch (e) {}
    if (Calendar_isCurrentDay(cell))
        cell.style.backgroundColor = Calendar_currentDayColor;
    else if (Calendar_isWeekend(cell))
        cell.style.backgroundColor = Calendar_weekendDayColor;
    else
        cell.style.backgroundColor = Calendar_workingDayColor;
    cell.style.borderColor = '';
}

function Calendar_setCellStyle(cell, isHoliday)
{
    if(Calendar_isCurrentDay(cell))
    {
        cell.className = 'calendarCurrentDay';
        cell.style.backgroundColor = Calendar_currentDayColor;
    }
    else if (isHoliday)
    {
        cell.className = 'calendarWeekendDay';
        cell.style.backgroundColor = Calendar_weekendDayColor;
    }
    else
    {
        cell.className = 'calendarWorkingDay';
        cell.style.backgroundColor = Calendar_workingDayColor;
    }

    var span = cell.firstChild;
    if(span && span.nodeName == 'SPAN')
    {
        if(span.className.indexOf('CurrentMonth') != -1)
            span.className = isHoliday ? "calendarCurrentMonthWeekendDay" : "calendarCurrentMonthWorkingDay";
        else
            span.className = isHoliday ? "calendarOtherMonthWeekendDay" : "calendarOtherMonthWorkingDay";
    }
}

Calendar.prototype.openPopup =
function Calendar_openPopup(title, params, calendarHtml)
{
    var calendarWnd = window.open("", title, params);
    calendarWnd.opener = self;
    calendarWnd.document.write(calendarHtml);
    calendarWnd.document.close();
}

function TableElement(text, style, textStyle, link, hasFrame)
{
  this.text = text;
  this.style = style;
  this.textStyle = textStyle;
  this.link = link;
  this.hasFrame = hasFrame;
}

/**
* Styles you can use:
*
*  - calendarWeekDay
*  - calendarCurrentDay
*  - calendarWorkingDay
*  - calendarWeekendDay
*  - calendarCurrentMonthDay
*  - calendarOtherMonthDay
*
*/
Calendar.prototype.getCalendarHTML =
function Calendar_getCalendarHTML()
{
    var calendarTable = new Array();

    calendarTable[0] = new Array();
    for (var n = 0; n < 7; n++)
    {
        wd = (this.weekStartDay + n) % 7;
        style = wd == 0 || wd == 6 ? "calendarWeekendDayHeader" : "calendarWorkingDayHeader"
        calendarTable[0][n] = new TableElement(this.weekDays[wd], style, null, null, false);
    }

    var curWeek = 1;
    var curDay = new Date(this.firstDay);
    while (curDay.getMonth() == this.baseDate.getMonth() ||
           curDay.getMonth() == this.firstDay.getMonth())
    {
        calendarTable[curWeek] = new Array();
        for (var currentWeekDay = 0; currentWeekDay < 7; currentWeekDay++)
        {
            var text;
            var style;
            var textStyle;
            var link;
            var hasFrame = this.startFrameDate != null && this.endFrameDate != null
                && curDay.getTime() >= this.startFrameDate.getTime() && curDay.getTime() <= this.endFrameDate.getTime();
            var currentDayNow = curDay.getFullYear() == this.today.getFullYear() &&
                                curDay.getMonth()    == this.today.getMonth() &&
                                curDay.getDate()     == this.today.getDate();
            var dayIsHoliday = curDay.getDay() == 0 || curDay.getDay() == 6;

            
            if(!this.displayDaysOfOtherMonths && curDay.getMonth() != this.baseDate.getMonth()){

                
                text = "&nbsp;";
                style = "calendarEmptyDayCell";
                textStyle = dayIsHoliday ?  "calendarOtherMonthWeekendDay" : "calendarOtherMonthWorkingDay";
                calendarTable[curWeek][currentWeekDay] = new TableElement(text, style, textStyle, null, hasFrame);
                curDay.setDate(curDay.getDate() + 1);
                continue;   
            }

            for(var i = 0; i < this.invertedDays.length; i++)
            {
                invDate = strToDate(this.invertedDays[i]);
                if(curDay.getFullYear() == invDate.getFullYear() &&
                   curDay.getMonth()    == invDate.getMonth() &&
                   curDay.getDate()     == invDate.getDate())
                {
                    dayIsHoliday = !dayIsHoliday;
                    break;
                }
            }

            if (currentDayNow && this.hilightCurrentDay)
            {
                style = this.currentDayStyle;
            }
            else
            {
                style = dayIsHoliday ? this.nonWorkDayStyle : this.workDayStyle;
            }

            if (curDay.getMonth() == this.baseDate.getMonth())
            {
                textStyle = dayIsHoliday ?  "calendarCurrentMonthWeekendDay" : "calendarCurrentMonthWorkingDay";
            }
            else
            {
                textStyle = dayIsHoliday ?  "calendarOtherMonthWeekendDay" : "calendarOtherMonthWorkingDay";
            }

            text = curDay.getDate();

            if(currentDayNow != true || (currentDayNow == true && this.linkCurrentDay == true))
            {
                var goToDate = dateToStr(this.validDay(curDay));
                if(this.inPopup)
                    link="javascript: window.opener." + this.callbackFunc + "('" + goToDate + "', this);" +
                        "window.close();";
                else
                    link="javascript: if(typeof " + this.callbackFunc + " != typeof undefined){" + this.callbackFunc + "('" + goToDate + "', this);}";
            } else link = null;

            calendarTable[curWeek][currentWeekDay] = new TableElement(text, style, textStyle, link, hasFrame);
            curDay.setDate(curDay.getDate() + 1);
        }
        curWeek++;
    }

    var calendarHtml = "";


    calendarHtml += "<table id='calendar_table' width=\"100%\" border=0 bgcolor=#b5b5b5 cellspacing=1 cellpadding=0 class=calendarTable";
    if(this.highliteFrame){
        calendarHtml += " onmouseout='if (typeof Calendar_calendarTableOut != typeof undefined) Calendar_calendarTableOut(event)' onmouseover='if (typeof Calendar_calendarTableOver != typeof undefined) Calendar_calendarTableOver(event, this)'"
    }
    calendarHtml += ">";
    if(this.header)
       calendarHtml += "<tr><td class=\"currentMonthHeader\" colspan=\"7\" align=\"center\">" +
            this.getMonthLabel() + ", " + this.getYearLabel() + "</td>";

    this.weeksCount = calendarTable.length;
    for (var r = 0; r < calendarTable.length; r++)
        calendarHtml += this.getCalendarRowHTML(calendarTable, r);

    calendarHtml += "</table>";
    var frame = "<div id='calendar_frame' style='padding:0 0 0 0; margin:0 0 0 0; cursor:pointer;display:none;position:absolute;z-index:1001;border-style:solid;border-width:2px;border-color:"+ Calendar_hiColor +";' ><img id='calendar_frame_image' src='/img/default/pixel.gif?hash=797059755'></div>"
    calendarHtml += frame;
    return calendarHtml;
}

Calendar.prototype.validDay = function(day) {
    if (this.changeMonthIfDateOutsideCurrentMonth) return day;

    if(
        day.getMonth() < this.baseDate.getMonth() && day.getFullYear() == this.baseDate.getFullYear() ||
        day.getFullYear() < this.baseDate.getFullYear()
    )
        return new Date(this.baseDate.getFullYear(), this.baseDate.getMonth(), 1);

    if(
        day.getMonth() > this.baseDate.getMonth() && day.getFullYear() == this.baseDate.getFullYear() ||
        day.getFullYear() > this.baseDate.getFullYear()
    )
        return new Date(this.baseDate.getFullYear(), this.baseDate.getMonth(), this.getMaxDayOfMonth(this.baseDate.getFullYear(), this.baseDate.getMonth()));

    return day;
}

// Returns maximum day of month by specified month and year.
Calendar.prototype.getMaxDayOfMonth = function(year, month) {
    switch( month )
    {
        case 0: case 2: case 4: case 6: case 7: case 9: case 11: return 31;
        case 3: case 5: case 8: case 10: case 7: case 9: case 11: return 30;
        case 1: return (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) ? 29 : 28;
    }
}


Calendar.prototype.getCalendarRowHTML =
function Calendar_getCalendarRowHTML(calendarTable, r)
{
    if(this.highliteFrame && r != 0)
        var html = "<tr id='calendar_row_" + r +"' onmouseover='" + this.onmouseOverHandler + "' onmouseout='" + this.onmouseOutHandler + "'" + ">";
    else
        var html = "<tr id='calendar_row_0'>";
    for (var day = 0; day < 7; day++)
    {
        var elem = calendarTable[r][day];
        var content = elem.text;
        var style = " class=" + elem.style;

        html += "<td " + style;
        if (elem.link)
            html += " onclick=\"" + elem.link + "\"";
            //html += " onclick=\"alert('"+escape(elem.link)+"')\"";
        var borderStyle;
        if (calendarTable[r][day].hasFrame) {
            var color = '#face00';
            if (day == 0)
                borderStyle = 'padding:1 2 1 1; border-width: 2 0 2 2; border-color:' + color + ' #ffffff ' + color + ' ' + color + ';';
            else if (day == 6)
                borderStyle = 'padding:1 1 1 2; border-width: 2 2 2 0; border-color:' + color + ' ' + color + ' ' + color + ' #ffffff';
            else
                borderStyle = 'padding:1 2 1 2; border-width: 2 0 2 0; border-color:' + color + ' #ffffff ' + color + ' #ffffff';
            html += " style='" + borderStyle + "'" + "id='Calendar_frameElement'";
        }

        if (elem.link && !this.highliteFrame)
            html += " onmouseover='" + this.onmouseOverHandler + "' onmouseout='" + this.onmouseOutHandler + "'";

        html += ">";

        if (elem.textStyle)
            html += "<span class='" + elem.textStyle + "'>" + content + "</span></td>";
        else
            html += content + "</td>";
    }
    html += "</tr>";
    return html;
}

Calendar.prototype.setMonths =
function Calendar_setMonths(months)
{
    this.months = months;
}

Calendar.prototype.setHeader =
function Calendar_setHeader(header)
{
    this.header = header;
}

Calendar.prototype.setLinkCurrentDay =
function Calendar_setLinkCurrentDay(linkCurDay)
{
   this.linkCurrentDay = linkCurDay;
}

Calendar.prototype.setWeekDays =
function Calendar_setWeekDays(weekDays)
{
    this.weekDays = weekDays;
}

Calendar.prototype.setDisplayDaysOfOtherMonths =
function Calendar_setDisplayDaysOfOtherMonths(displayDaysOfOtherMonths){

    this.displayDaysOfOtherMonths = displayDaysOfOtherMonths;
}

Calendar.prototype.getCallback =
function Calendar_getCallback()
{
    return this.callbackFunc;
}

Calendar.prototype.getMonthLabel =
function Calendar_getMonthLabel()
{
    return this.months[this.baseDate.getMonth()];
}

Calendar.prototype.getYearLabel =
function Calendar_getYearLabel()
{
    return this.baseDate.getFullYear();
}

Calendar.prototype.setStyleNames =
function Calendar_setStyleNames(workDayStyle, nonWorkDayStyle, currentDayStyle)
{
    this.workDayStyle = workDayStyle;
    this.nonWorkDayStyle = nonWorkDayStyle;
    this.currentDayStyle = currentDayStyle;
}

Calendar.prototype.setHilightCurrentDay =
function Calendar_setHilightCurrentDay(doSelection)
{
    this.hilightCurrentDay = doSelection;
}

Calendar.prototype.getTodayDay =
function Calendar_getTodayDay()
{
    return this.today.getDate();
}

Calendar.prototype.getTodayMonth =
function Calendar_getTodayMonth()
{
    return this.months[this.today.getMonth()];
}

Calendar.prototype.getTodayMonthNumber =
function Calendar_getTodayMonthNumber()
{
    return this.today.getMonth();
}

Calendar.prototype.getTodayYear =
function Calendar_getTodayYear()
{
    return this.today.getFullYear();
}

Calendar.prototype.getCurrentDay =
function Calendar_getCurrentDay()
{
    return this.baseDate.getDate();
}

Calendar.prototype.getCurrentMonth =
function Calendar_getCurrentMonth()
{
    return this.months[this.baseDate.getMonth()];
}

Calendar.prototype.getCurrentMonthNumber =
function Calendar_getCurrentMonthNumber()
{
    return this.baseDate.getMonth();
}

Calendar.prototype.getCurrentYear =
function Calendar_getCurrentYear()
{
    return this.baseDate.getFullYear();
}

Calendar.prototype.getNextMonth =
function Calendar_getNextMonth()
{
    return this.months[this.prevMonth];
}

Calendar.prototype.getPrevMonth =
function Calendar_getPrevMonth()
{
    return this.months[this.nextMonth];
}

Calendar.prototype.getNextMonthNumber =
function Calendar_getNextMonthNumber()
{
    return this.months[this.prevMonth];
}

Calendar.prototype.getPrevMonthNumber =
function Calendar_getPrevMonthNumber()
{
    return this.months[this.nextMonth];
}

Calendar.prototype.getCustomDateURL =
function Calendar_getCustomDateURL(year, month, day)
{
    return "javascript:window.opener.showCalendar('" + year + "-" + month + "-" + day + "', '" + dateToStr(this.today) + "', " + this.startDate.getFullYear() + ", " + this.endDate.getFullYear() + ", '" + this.callbackFunc + "');"
}

Calendar.prototype.getCustomDateJS =
function Calendar_getCustomDateJS(year, month, day)
{
    return "window.opener.showCalendar('" + year + "-" + month + "-" + day + "', '" + dateToStr(this.today) + "', " + this.startDate.getFullYear() + ", " + this.endDate.getFullYear() + ", '" + this.callbackFunc + "');"
}

Calendar.prototype.getEndDate =
function Calendar_getEndDate()
{
   return this.endDate;
}

Calendar.prototype.getStartDate =
function Calendar_getStartDate()
{
   return this.startDate;
}

/**
* Styles you can use:
*
*  - calendarYearsSelector
*  - calendarMonthsSelector
*
* @param    pattern Pattern. YEAR lexeme will be replaced with year
*                   selector and MONTH lexeme with months selector
*/

// YYYY-MM-DD
function strToDate(strDateTime)
{
    var re = /^(\d+)\-(\d+)\-(\d+)$/;

    if (!re.exec(strDateTime))
        return alert("Invalid Datetime format: "+ strDateTime);

    return newDate(RegExp.$1, RegExp.$2 - 1, RegExp.$3);
}

// YYYY-MM-DD
function dateToStr(date)
{
    return new String(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
}

function getSelectedValue(selector)
{
    if (selector && selector.options)
        return selector.options[selector.selectedIndex].value;
}
