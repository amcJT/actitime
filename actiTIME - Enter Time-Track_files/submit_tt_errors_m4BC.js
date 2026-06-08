function SubmitTTErrors() {}

SubmitTTErrors.getTTExceedsDayLimitMessage = function(day, limit)
{
    return messageResource.getMessage("submit_tt.err_exceeds_day_limit", [calLayout[day], limit]);
}

// Marks only TT entries as invalid, but not the leave button.
SubmitTTErrors.markDayTTAsInvalid = function(day)
{
    for(i = 0; i < taskIds.length; i++)
    {
        var field = document.SubmitTTForm.elements["timeTrack[" + taskIds[i]+ "].spentStr[" + day + "]"];
        if(field && field.type && field.type != "text")
            field = document.getElementById("complTask[" + taskIds[i] + "].day[" + day + "]");
        if(field)
        {
            if(field.name && fieldErrors[field.name]) continue;
            field.style.color = ClientSideErrors.errorHighlightColor;
            field.title = SubmitTTErrors.getTTExceedsDayLimitMessage(day, maxMinutesPerDayStr);
        }
    }
    SubmitTTErrors.highlightDayTotal(day, ClientSideErrors.errorHighlightColor, SubmitTTErrors.getTTExceedsDayLimitMessage(day, maxMinutesPerDayStr));
    SubmitTTErrors.registerDayError(day);
}

// Marks the leave button as invalid.
SubmitTTErrors.markDayLeaveInfoAsInvalid = function(day, errorText)
{
    LeaveButtons.markButtonAsInvalid(day, errorText);
    SubmitTTErrors.registerDayError(day);
}

// Marks the whole day as valid (incl. TT entries and leave button).
SubmitTTErrors.markDayAsValid = function(day)
{
    if(!dayErrors[day]) return;
    for(i = 0; i < taskIds.length; i++)
    {
        var field = document.forms[0].elements["timeTrack[" + taskIds[i]+ "].spentStr[" + day + "]"];
        if(field && field.type && field.type != "text")
            field = document.getElementById("complTask[" + taskIds[i] + "].day[" + day + "]");
        if(field)
        {
            if(field.name && fieldErrors[field.name]) continue;
            field.style.color = "";
            field.title = '';
        }
    }
    SubmitTTErrors.highlightDayTotal(day, '', '');
    LeaveButtons.markButtonAsValid(day);    
    SubmitTTErrors.unregisterDayError(day);
}

SubmitTTErrors.highlightDayTotal = function(day, color, title)
{
    var dayTotalField = document.getElementById("dayTotal[" + day + "]");
    if(dayTotalField)
    {
        dayTotalField.style.color = color;
        dayTotalField.title = title;
    }
}

SubmitTTErrors.registerDayError = function(day)
{
    dayErrors[day] = true;
}

SubmitTTErrors.unregisterDayError = function(day)
{
    if(dayErrors[day])
        delete dayErrors[day];
}

SubmitTTErrors.hideClientSideErrorMessageIfNoErrors = function()
{
    if(!SubmitTTErrors.hasErrors())
        ClientSideErrors.hideClientSideErrorMessage();
}

SubmitTTErrors.hasErrors = function()
{
    var count = 0;
    for(var i in dayErrors)
    {
        if(dayErrors[i])
            count++;
    }

    return count > 0 || ClientSideErrors.hasErrors();
}