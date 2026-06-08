// requires:
//  leave_js.jsp

var oldKeydownEvent;
// current field value
var currentValue = null;
var dataModified = {};

var SubmitTTConstants = {};

var cursorMovingForbidden = false;

var lockedBySubmitting = false;

SubmitTTConstants.thirdHierarchyLevelNameSingular = "";
SubmitTTConstants.secondHierarchyLevelNameSingular = "";
SubmitTTConstants.secondHierarchyLevelNamePlural = "";
SubmitTTConstants.thirdHierarchyLevelNamePlural = "";
SubmitTTConstants.thirdHierarchyLevelNameSingularCapitalized = "";

var TaskRowStatus = {
    SELECTED: -201,
    SLIGHTLY_SELECTED: -202,
    NORMAL: -203
};

/*
 Used to determine which row is currently selected.
 We need to control this not to move selection to another row if button's menu is currently shown
 */
var currentSelectedRow = null;
var currentSelectedRowStatus = TaskRowStatus.NORMAL;

var mouseOverRowTimeout = null;
var mouseOutRowTimeout = null;
var mouseWheelEngaged = 0;

function getTaskIdFromTTField(field)
{
    if(field && field.name)
    {
        return parseInt(field.name.substring(10, field.name.indexOf("].spentStr[")));
    }
    return NaN;
}

function registerModifiedTTField(day, field)
{
    var taskId = getTaskIdFromTTField(field);
    if(field && !isNaN(taskId))
    {
        if(isNaN(taskId)) return;
        if(!dataModified[day])
            dataModified[day] = {};
        dataModified[day][taskId] = field;
    }
}

function unregisterModifiedTTField(day, field)
{
    var taskId = getTaskIdFromTTField(field);
    if(field && !isNaN(taskId))
    {
        if(dataModified[day])
            delete dataModified[day][taskId];
    }
}

function dayTTValuesWereChanged(day)
{
    if(!dataModified[day]) return false;
    var count = 0;
    for(var i in dataModified[day])
    {
        if(dataModified[day][i])
            count++;
    }
    return count > 0;
}

// TIME_TRACK FUNCTIONS
// returns day total for a given day. takes it from "day total" text element
function getDayTotal(day)
{
    var el = document.getElementById("dayTotal[" + day + "]");
    if(el)
        return UserTime.parseTime(el.firstChild.nodeValue, true);
    else
        return 0;
}

function setDayTotal(day, dayTotal)
{
    el = document.getElementById("dayTotal[" + day + "]");
    if(el)
        el.firstChild.nodeValue = UserTime.formatTimeWithDigitSeparator(dayTotal);
}

function updateWeekTotal(plusWeekTotal)
{
    el = document.getElementById("weekTotal");
    if(el)
    {
        var weekTotal = UserTime.parseTime(el.firstChild.nodeValue, true);
        weekTotal += plusWeekTotal;
        el.firstChild.nodeValue = UserTime.formatTimeWithDigitSeparator(weekTotal);
    }
}

/**
 * @return leave time for the day. If leave time is full day, then returns workday duration.
 */
function getDayLeaveTime(day)
{
    var dayLeaveTime = LeaveButtons.getLeaveTimeForDay(day);
    return dayLeaveTime != null ? dayLeaveTime : Overtime.workdayDuration;
}


function fieldModified(nowValue)
{
    return nowValue != currentValue;
}

// handles onchange event on time-track inputs.
// validates the input, updates day total, updates week total, sets/removes data modified flag,
// sets/removes overtime exclamation
function checkSpent(day, field)
{
    if(field.value != field.defaultValue)
        registerModifiedTTField(day, field);
    else
        unregisterModifiedTTField(day, field);

    // if field was not modified, exit immediately
    if(!fieldModified(field.value)) return true;

    var ttValue = UserTime.parseTime(field.value);
    if(spentTimeIsInvalid(ttValue))
    {
        // entered time-track value is invalid. mark field as erroneous.
        ClientSideErrors.markTextFieldAsInvalid(field, SubmitTTErrors.INCORRECT_TT_VALUE);
        ttValue = 0;
    }
    else
    {
        // mark field as valid
        ClientSideErrors.markTextFieldAsValid(field);
        // if field is not empty, format time-track
        if(!(trim(field.value) == ""))
            field.value = UserTime.formatTime(ttValue);
        else
            field.value = "";
    }
    SubmitTTChanges.registerChange(field.name)
    // set "modifications not saved" flag
    handleChange(true);
    updateTotal(day, ttValue, UserTime.parseTime(currentValue));

    // update currentValue now, not waiting for the next onfocus, because onblur might be fired twice in Chrome
    currentValue = field.value;

    if (Overtime.overtimeShown) {
        Overtime.updateDayAndTotal(day);
    }

    SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();

    return true;
}

function updateTotal(day, nowValue, previousValue)
{
    // get daytotal
    var dayTotal = getDayTotal(day);
    var diff = nowValue - ((previousValue == null || previousValue < 0) ? 0 : previousValue);
    dayTotal += diff;
    setDayTotal(day, dayTotal);
    var leaveTime = getDayLeaveTime(day);

    // clean previous error, if exists
    SubmitTTErrors.markDayAsValid(day);

    // if day total for a day is greater than limit, highlight an error, but only if TT for the day was changed 
    if (isHoursPerDayLimited && dayTotal > maxMinutesPerDay && dayTTValuesWereChanged(day))
        SubmitTTErrors.markDayTTAsInvalid(day);

    // if day leave time is greater than limit, highlight an error, but only if the leave info for the day was changed
    if (leaveTime > Overtime.workdayDuration && LeaveButtons.isLeaveInfoChanged(day))
        SubmitTTErrors.markDayLeaveInfoAsInvalid(day);

    updateWeekTotal(diff);
}

function onkeyupHandler(evt)
{
    var defaultValue = currentValue; // variable is needed for firefox, because it lost "currenValue" variable before "field.value != defaultValue" statement
    var event = evt ? evt : window.event ? window.event : null;
    if(event)
    {
        var field = event.target ? event.target : event.srcElement;
        if(field && field.type && field.type == 'text' && field.name &&
           field.form == document.SubmitTTForm &&
           field.value != defaultValue) {
            handleChange(true);
        }
    }
    return true;
}

// handler for onfocus event on time-track input fields. saves the value to the global variable
function focusSpent(field)
{
    currentValue = field.value;
}

// calculates total for a given task
function calculateTimeTrack(taskId)
{
   var total = 0;
   for(i = 0; i < 7; i++)
   {
        if(document.SubmitTTForm.elements["timeTrack[" + taskId + "].spentStr[" + i + "]"])
            total += UserTime.parseTime(document.SubmitTTForm.elements["timeTrack[" + taskId + "].spentStr[" + i + "]"].value);
   }
   return total;
}

/**
 * Returns true if task marked for deletion
 * @param taskId is id of the task to get status for. Not null.
 */
function isTaskMarkedForDeletion(taskId)
{
    var prop = document.getElementById("isRowDeleted"+taskId);
    if (!prop)
        return false;

    return prop.value == "1";
}

/**
 * Toggles "marked for deletion" flag for the specified time track.
 * Actual deletion will happen when form is submitted.
 * If this method is called for a task that is already marked for deletion, the flag will be reseted.
 */

function deleteTimeTrack(taskId)
{
    if (!document.getElementById("isRowDeleted"+taskId))
        return false;  //there is no task with specified id at the page.

    if (!saveOnPageDescription())   return false;

    if (!closeAllPopups()) {
        return false;
    }

    var isMarkedForDeletion = isTaskMarkedForDeletion(taskId);

    var deletionConfirmed = true;
    if (!isMarkedForDeletion)
    {
        if(calculateTimeTrack(taskId) == 0 && !commentsPresent(taskId))
            deletionConfirmed = true;
        else
        {
            forbidMovingCursor();
            deletionConfirmed = confirm(messageResource.getMessage('submit_tt.delete_tt_confirm', 
                    [SubmitTTConstants.thirdHierarchyLevelNameSingular]));
            allowMovingCursor();
        }
    }

    if (deletionConfirmed)
    {
        handleChange(true);

        isMarkedForDeletion = !isMarkedForDeletion;

        // here we check if timeTrack to be deleted is the only modified data
        for(i = 0; i < 7; i++)
        {
            var ttInputName = "timeTrack[" + taskId + "].spentStr[" + i + "]";
            ClientSideErrors.unregisterFieldError(ttInputName);
            var commentInputName = "timeTrack[" + taskId + "].comment[" + i + "]";
            ClientSideErrors.unregisterFieldError(commentInputName);
            SubmitTTChanges.unregisterChange(commentInputName);
        }

        SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();

        setEnabledStatusForRowItems(taskId, !isMarkedForDeletion);

        for (var day=0; day < 7; day++)
        {
            var spentField = document.getElementById("spent_" + taskId + "_" + day);

            if (!spentField)
                continue;

            var ttvalue = spentField.value;

            registerModifiedTTField(day, spentField);

            if (isMarkedForDeletion)
            {
                updateTotal(day, 0, UserTime.parseTime(ttvalue));
            }
            else
            {
                currentValue = 0;
                checkSpent(day, spentField);
            }

            if (Overtime.overtimeShown) {
                Overtime.updateDayAndTotal(day);
            }
        }

        SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();
        return true;
    } else {
        return false;
    }
}

var taskRowsInitialTitle = {};

/**
 * Sets enabled status for elements of row with specified taskId
 * @param taskId is id of task to set disabled element status for.
 * @param isEnabled true if function must set status to 'enable', false otherwise.
 */
function setEnabledStatusForRowItems(taskId, isEnabled)
{
    document.getElementById("isRowDeleted"+taskId).value = isEnabled ? "0" : "1";

    var taskRow = document.getElementById("taskRow"+taskId);

    if (isEnabled)
    {
        replaceClass(taskRow, "rowToDelete", "actualRow");
        taskRow.title = '';
    }
    else
    {
        replaceClass(taskRow, "actualRow", "rowToDelete");
        taskRow.title = messageResource.getMessage('submit_tt.row_marked_for_removal',
                                                   [SubmitTTConstants.thirdHierarchyLevelNameSingular] );
    }

    var deadlineBlock = document.getElementById('deadline' + taskId);

    if (isEnabled)
    {
        rowToRemoveCellsTitle = taskRowsInitialTitle[taskId].names;
        deadlineCellsTitle = taskRowsInitialTitle[taskId].deadline;
    }
    else
    {
        taskRowsInitialTitle[taskId] = {}
        taskRowsInitialTitle[taskId].names = document.getElementById('customerNameCell' + taskId).title;

        if (deadlineBlock)
            taskRowsInitialTitle[taskId].deadline = deadlineBlock.title;
        
        rowToRemoveCellsTitle = messageResource.getMessage('submit_tt.row_marked_for_removal',
                                                            [SubmitTTConstants.thirdHierarchyLevelNameSingular] );
        deadlineCellsTitle = rowToRemoveCellsTitle;
    }

    document.getElementById('customerNameCell' + taskId).title = rowToRemoveCellsTitle;
    document.getElementById('projectNameCell' + taskId).title = rowToRemoveCellsTitle;
    document.getElementById('taskNameCell' + taskId).title = rowToRemoveCellsTitle;
    if (deadlineBlock)
        deadlineBlock.title = deadlineCellsTitle;

    for (var day = 0; day < 7; day++)
    {
        var spentField = document.getElementById("spent_" + taskId + "_" + day);

        if (spentField)
        {
            ClientSideErrors.paintElementAsValid(spentField);

            if (isEnabled)
            {
                spentField.readOnly = "";
                spentField.title = "";
                spentField.className = spentField.className.replace(" modifiedSpentField", "");
            }
            else
            {
                spentField.readOnly = "true";

                if ( spentField.value.length > 0 )
                {
                    spentField.className = spentField.className + " modifiedSpentField";
                }

                spentField.title = rowToRemoveCellsTitle;
            }
        }

        var commentImg = document.getElementById("timeTrack["+taskId+"].commentImg["+day+"]");

        if (commentImg)
        {
            if (isEnabled)
            {
                if (commentImg.src.indexOf("_disabled.gif") > 0)
                    commentImg.src = commentImg.src.replace("_disabled.gif", ".gif")

                commentImg.title = messageResource.getMessage("submit_tt.description_tooltip");
            }
            else
            {
                commentImg.src = commentImg.src.replace(".gif", "_disabled.gif")
                commentImg.title = messageResource.getMessage('submit_tt.row_marked_for_removal',
                                                              [SubmitTTConstants.thirdHierarchyLevelNameSingular] );
            }
        }
    }

    OldIERerenderHack();
}

/**
 * Toggles "marked for completion" flag for given task.
 * Completion will be actually performed after the form is submitted.
 * If this method is called for a task that is already marked for completion, the flag will be reseted.
 * @param taskId Task ID
 */
function completeTask(taskId) {
    if (!document.getElementById("isTaskCompleted"+taskId))
        return false;  //there is no task with specified id at the page.

    if (!saveOnPageDescription())   return false;

    if (!closeAllPopups()) {
        return false;
    }

    var wasMarkedForCompletion = isTaskMarkedForCompletion(taskId);
    handleChange(true);
    setCompletedStatusForRowItems(taskId, !wasMarkedForCompletion);
    SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();
    return true;
}

/**
 * Returns true if specified task is marked for completion
 * @param taskId Task ID
 */
function isTaskMarkedForCompletion(taskId) {
    var prop = document.getElementById("isTaskCompleted"+taskId);
    if (!prop) return false;

    return (prop.value == 1);
}

/**
 * Returns true if specified task belongs to an archived project.
 * @param taskId Task ID
 */
function isTaskInArchivedProject(taskId) {
    var prop = document.getElementById("isInArchivedProject"+taskId);
    if (!prop) return false;

    return (prop.value == 1);
}

/**
 * Set style and status for row elements corresponding to given task.
 * @param taskId Task ID
 * @param isMarkedForCompletion Whether the task is marked for completion
 */
function setCompletedStatusForRowItems(taskId, isMarkedForCompletion) {
    document.getElementById("isTaskCompleted"+taskId).value = isMarkedForCompletion ? "1" : "0";

    var taskRow = document.getElementById("taskRow"+taskId);

    if (isMarkedForCompletion)
    {
        replaceClass(taskRow, "actualRow", "rowToComplete");
    }
    else
    {
        replaceClass(taskRow, "rowToComplete", "actualRow");
    }

    OldIERerenderHack();
}

function initDeletedTaskRow(taskId)
{
    for (day=0; day < 7; day++)
    {
        var spentField = document.getElementById("spent_" + taskId + "_" + day);

        if (!spentField)
            continue;

        var value = spentField.value;
        spentField.defaultValue = "";
        spentField.value = value;
    }

    setEnabledStatusForRowItems(taskId, false);
}


function SubmitTimeTrack(evt, hoursPerDayLimited, maximumMinutesPerDay, maximumMinutesPerDayString)
{
    if(!isLocked())
    {
        setLock();
        var event = evt ? evt : (window.event ? window.event : null);

        if(SubmitTTErrors.hasErrors())
        {
            setRedirectUrl("");
            deleteMessages();
            ClientSideErrors.showClientSideErrorMessage();
            if(document.all && event != null)
                event.returnValue = false;
            resetLock();
            return false;
        }

        if (!saveOnPageDescription())
        {
            resetLock();
            return false;
        }

        if (!LeavePopup.validateAndSave())
        {
            resetLock();
            return false;
        }

        document.SubmitTTForm.pageAction.value = 'save_tt';
        document.SubmitTTForm.submit();
        return true;
    }
    return false;
}

function isLocked()
{
    return lockedBySubmitting;
}

function setLock()
{
    lockedBySubmitting = true;
    var textBottom = document.getElementById("savingTextBottom");
    var textTop = document.getElementById("savingTextTop");
    if(document.SubmitTTForm.formDataModified.value == "true")
        textBottom.className = "savingTextModified";
    textBottom.style.display = "inline";
    if(document.SubmitTTForm.formDataModified.value == "true")
        textTop.style.visibility = "visible";
    setTimeout("resetLock()", 10000);
}

function resetLock()
{
    document.getElementById("savingTextBottom").style.display = "none";
    document.getElementById("savingTextTop").style.visibility = "hidden";
    lockedBySubmitting = false;
}

function registerHandlers()
{
    registerFormChangedHandlers(true);
    document.body.onkeyup = onkeyupHandler;
    if(document.SubmitTTForm.formDataModified.value == "true")
    {
        handleChange(false);
    }
}

function commentsPresent(taskId) {
    var f = document.SubmitTTForm;
    for(var i = 0; i < 7; i++) {
        s = "timeTrack[" + taskId + "].comment[" + i + "]";
        if(f.elements[s] && f.elements[s].value != "")
               return true;
    }
    return false;
}


function onDayLeaveInfoChange(day)
{
    handleChange(true);

    // We call updateTotal in order to:
    //  - clean leave info error status, if exists
    //  - keep TT entries error status, if exists
    updateTotal(day, 0, 0);

    SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();

    if (Overtime.overtimeShown) {
        Overtime.updateDayAndTotal(day);
    }
}


/**
 * Firefox remembers entered form data on exit. When the user starts the browser again, it reloads the page and
 * pre-fills text fields with remembered data. As a result, the user thinks that this data was loaded from
 * the server, but actually it exists only in browser.
 *
 * See bug #29419.
 *
 * This object is a workaround for this bug.
 */
var FirefoxFormCacheFix = {

    /**
     * Initializes the fix.
     * Must be called from the script placed just after the form.
     * Remembers the data loaded from the server, before the browser replaces it.
     * Also hides all the fields to prevent flickering.
     * @param form
     */
    init: function (form)
    {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1)
            return;

        this.form = form;
        this.fieldValues = {};
        this.fieldVisibilities = {};

        var inputFields = this.form.getElementsByTagName('input');

        for (var i = 0; i < inputFields.length; i++)
        {
            var element = inputFields[i];

            if (element.name)
            {
                this.fieldValues[element.name] = element.value;
                this.fieldVisibilities[element.name] = element.style.visibility;
                element.style.visibility = "hidden";
            }
        }
    },

    /**
     * Applies the fix - restores the form data and fields visibility remembered in the init method.
     * Must be called from the body onload handler (after the browser replaces the form data).
     */
    apply: function ()
    {
        if (! this.form || ! this.fieldValues || ! this.fieldVisibilities)
            return;

        for (var name in this.fieldValues)
        {
            if (this.form[name])
            {
                this.form[name].value = this.fieldValues[name];
                this.form[name].style.visibility = this.fieldVisibilities[name];
            }
        }
    }
}

/**
 * IE6 & IE7 tend not to render content correctly after changing elements classes.
 * For example, they wouldn't render 'undo' button after marking a task as complete.
 * This hack makes these browsers re-render the content.
 */
function OldIERerenderHack()
{
    if (Ext.isIE6 || Ext.isIE7)
    {
        var style = document.styleSheets[0].rules[0].style;
        var oldValue = style.color;
        style.color = '#123456';
        style.color = oldValue;
    }
}

function allowMovingCursor()
{
    cursorMovingForbidden = false;
}

function forbidMovingCursor()
{
    cursorMovingForbidden = true;
}
    
function isCursorMovingForbidden()
{
    return cursorMovingForbidden;
}

/**
 * Removes selection cursor if mouse leaves the table when dropdown menu is displayed.
 */
function hideSelectionCursorIfNeeded( event )
{
    if( isCursorMovingForbidden( ) ) return;

    event = event || window.event;

    if( currentSelectedRow != null )
    {
        var actualRowsBody = document.getElementById( "actualTTRows" );
        if( !isMouseOverElement( actualRowsBody, event ) )
        {
            return onMouseOutRow( currentSelectedRow, event );
        }
    }
    else return;
}



