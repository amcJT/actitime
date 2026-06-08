Overtime = {};

Overtime.holidays = new Array();
Overtime.values = new Array();
Overtime.disabledInputs = new Array();
Overtime.lockedDays = new Array();

Overtime.userHireDay = null;
Overtime.userReleaseDay = null;
Overtime.today = null;
// NB:
// If userHireDay < Week.FIRST_DAY it means that the user was hired before this week.
// If userHireDay > Week.LAST_DAY it means that the user was hired after this week.
// The same for userReleaseDay and today.

Overtime.dayBeforeHireDateTooltip = null;
Overtime.dayAfterReleaseDateTooltip = null;
Overtime.dayInFutureTooltip = null;

Overtime.OvertimeValue = function(day, strValue, autocalculated) {
    this.day = day;
    this.setStrValue(strValue);
    this.autocalculated = autocalculated;
}

Overtime.OvertimeValue.prototype.formattedValue = function() {
    return this.strValue;
}

Overtime.OvertimeValue.prototype.setValue = function(newValue) {
    this.value = newValue;

    if (Overtime.trustedMode)
        this.strValue = UserTime.formatTime(newValue);
    else
        this.strValue = UserTime.formatTimeWithDigitSeparator(newValue);
}

Overtime.OvertimeValue.prototype.setStrValue = function(strValue) {
    var parsed = UserTime.parseTime(strValue);
    this.value = parsed == null ? 0 : parsed;
    this.strValue = parsed == null ? strValue : UserTime.formatTime(parsed);
}

Overtime.calculateOvertime = function(day) {
    if (Overtime.isOutsideHireReleaseDateInterval(day) || Overtime.isInFuture(day))
        return 0;

    var dayTotal = getDayTotal(day);
    var holiday = Overtime.holidays[day];

    if (holiday) return dayTotal;

    var dayLeaveTime = getDayLeaveTime(day);

    var autoCalculated = dayTotal + Math.min(dayLeaveTime - Overtime.workdayDuration, 0);

    return !Overtime.undertimeEnabled ?
           Math.max( autoCalculated, 0 ) :
           autoCalculated;
}

Overtime.isOutsideHireReleaseDateInterval = function(day) {
    return Overtime.isBeforeHireDate(day) || Overtime.isAfterReleaseDate(day);
}

Overtime.isBeforeHireDate = function(day) {
    return Overtime.userHireDay != null && day < Overtime.userHireDay;
}

Overtime.isAfterReleaseDate = function(day) {
    return Overtime.userReleaseDay != null && day > Overtime.userReleaseDay;
}

Overtime.isInFuture = function(day) {
    return day > Overtime.today; 
}

Overtime.updateOvertimeField = function(day) {
    var elem = Overtime.overtimeElement(day);
    var overtime = Overtime.values[day];
    if (Overtime.trustedMode && !Overtime.lockedDays[day]) {
        if (overtime.autocalculated)
            Overtime.setFieldToAuto(elem);
        else
            elem.value = overtime.formattedValue();
        if(Overtime.checkOvertimeValueIsValid(elem, day))
        {
            Overtime.checkOvertimeIsNotGreaterThanDayTotal(day);
        }
    } else { // not trusted  or  day locked
        if (Overtime.trustedMode || (!Overtime.isOutsideHireReleaseDateInterval(day) && !Overtime.isInFuture(day)))
        {
            elem.innerHTML = overtime.formattedValue();
        }
    }
}

Overtime.overtimeElement = function(day) {
    return document.getElementById('overtime[' + day + '].overtimeStr');
}

Overtime.setFieldToAuto = function(field) {
    field.value = Overtime.autoValue;
}

Overtime.updateOvertimeTotalField = function(total) {
    var elem = document.getElementById('overtimeTotal');
    elem.innerHTML = UserTime.formatTimeWithDigitSeparator(total);
}

Overtime.showQuestionMark = function(day) {
    var placeholder = document.getElementById('overtimeMarkPlaceholder' + day);
    var questionLink = document.getElementById('overtimeQuestionMark' + day);
    var exclamationLink = document.getElementById('overtimeExclamationMark' + day);
    placeholder.style.display = 'none';
    exclamationLink.style.display = 'none';
    questionLink.style.display = 'inline';
}

Overtime.showExclamationMark = function(day) {
    var placeholder = document.getElementById('overtimeMarkPlaceholder' + day);
    var questionLink = document.getElementById('overtimeQuestionMark' + day);
    var exclamationLink = document.getElementById('overtimeExclamationMark' + day);
    placeholder.style.display = 'none';
    questionLink.style.display = 'none';
    exclamationLink.style.display = 'inline';
}

Overtime.hideMarks = function(day) {
    var placeholder = document.getElementById('overtimeMarkPlaceholder' + day);
    var questionLink = document.getElementById('overtimeQuestionMark' + day);
    var exclamationLink = document.getElementById('overtimeExclamationMark' + day);
    questionLink.style.display = 'none';
    exclamationLink.style.display = 'none';
    placeholder.style.display = 'inline';
}

Overtime.updateOvertimeFieldImageMarkIfNeeded = function(day) {
    if (!Overtime.trustedMode || Overtime.lockedDays[day]) return;
    if(fieldErrors["overtime[" + day + "].overtimeStr"])
    {
        Overtime.hideMarks(day);
        return;
    }

    var overtime = Overtime.values[day];
    if (overtime.autocalculated || Overtime.disabledInputs[day]) {
        Overtime.showQuestionMark(day);
    } else {
        var value = Overtime.calculateOvertime(day);
        if (value != overtime.value)
            Overtime.showExclamationMark(day);
        else
            Overtime.hideMarks(day);
    }
}

Overtime.recalculateDay = function(day) {
    var overtime = Overtime.values[day];
    if (overtime.autocalculated)
        overtime.setValue(Overtime.calculateOvertime(day));
    return overtime.value;
}

Overtime.updateFieldsAndTotal = function() {
    var total = 0;
    for (var day = Overtime.weekStart; day <= Overtime.weekEnd; day++) {
        if (!Overtime.values[day]) break;
        total += Overtime.recalculateDay(day);
        Overtime.updateOvertimeField(day);
        Overtime.updateOvertimeFieldImageMarkIfNeeded(day);
    }

    Overtime.updateOvertimeTotalField(total);
}

Overtime.calculateTotal = function() {
    var total = 0;
    for (var day = Overtime.weekStart; day <= Overtime.weekEnd; day++) {
        if (!Overtime.values[day]) break;
        total += Overtime.recalculateDay(day);
    }

    return total;
}

Overtime.updateDayAndTotal = function(day) {
    if (!Overtime.overtimeElement(day))
        return; // if no overtime element, then it is future

    var total = Overtime.calculateTotal();
    Overtime.updateOvertimeField(day);
    Overtime.updateOvertimeFieldImageMarkIfNeeded(day);
    Overtime.updateOvertimeTotalField(total);
}

Overtime.markDayAsAutocalculated = function(day) {
    var overtime = Overtime.values[day];
    var field = Overtime.overtimeElement(day);

    overtime.autocalculated = true;
    Overtime.updateDayAndTotal(day);

    if (field.value != field.defaultValue){
        handleChange(true);
        SubmitTTChanges.registerChange(field.name)
    }

    Overtime.checkOvertimeValueIsValid(field, day);
    SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();
}

Overtime.startEditingDay = function(field, day) {
    var overtime = Overtime.values[day];
    var overtimeUndefined = typeof(overtime) == typeof(undefined); // it is needed to avoid js error in IE when some overtime input control is focused and page is refreshed

    if (overtimeUndefined)
        field.blur(); // removing focus from field
    
    if (!overtimeUndefined && overtime.autocalculated)
        field.value = '';
}

Overtime.endEditingDay = function(field, day) {
    var overtime = Overtime.values[day];
    var overtimeUndefined = typeof(overtime) == typeof(undefined); // it is needed to avoid js error when field.blur() is called from Overtime.startEditingDay (see this method)

    if (!overtimeUndefined) {
        var value = trim(field.value);
        if (value.length == 0)
            Overtime.setFieldToAuto(field);

        overtime.autocalculated = field.value == Overtime.autoValue;
        if (!overtime.autocalculated) {
            overtime.setStrValue(field.value);
            if (!Overtime.checkOvertimeValueIsValid(field, day))
            {
                Overtime.updateDayAndTotal(day);
                return;
            }
            Overtime.updateOvertimeField(day);
            Overtime.updateOvertimeFieldImageMarkIfNeeded(day);
        }
        Overtime.updateDayAndTotal(day);
        if(field.value != field.defaultValue)
            SubmitTTChanges.registerChange(field.name)

        Overtime.checkOvertimeIsNotGreaterThanDayTotal(day);
        SubmitTTErrors.hideClientSideErrorMessageIfNoErrors();
    }
}

// check that overtime is valid
Overtime.checkOvertimeValueIsValid = function(element, day)
{
    if (element.value != Overtime.autoValue) {
        var overtime = UserTime.parseTime(element.value);
        if (overtime == null || (!Overtime.undertimeEnabled && overtime < 0)) {
            ClientSideErrors.markTextFieldAsInvalid(element, SubmitTTErrors.INCORRECT_OT_VALUE);
            Overtime.hideMarks(day);
            return false;
        }
    }

    ClientSideErrors.markTextFieldAsValid(element);
    return true;
}

// check that overtime is not greater than day total
Overtime.checkOvertimeIsNotGreaterThanDayTotal = function(day)
{
    var overtime = Overtime.values[day];
    if (overtime == null) return;

    var elem = Overtime.overtimeElement(day);
    if (overtime.value > getDayTotal(day)) {
        ClientSideErrors.markTextFieldAsInvalid(elem, SubmitTTErrors.TOO_GREAT_OVERTIME);
    } else if (overtime.value < 0 && isHoursPerDayLimited &&
               Math.abs(overtime.value) > maxMinutesPerDay && !overtime.autocalculated) {
        ClientSideErrors.markTextFieldAsInvalid(elem, SubmitTTErrors.TOO_GREAT_UNDERTIME);
    } else {
        ClientSideErrors.markTextFieldAsValid(elem);
    }
}

Overtime.dhtmlTitle = new DhtmlTitle('overtimeTitle');

Overtime.hintOffsetX = -100;
Overtime.hintOffsetY = 25;

Overtime.getQuestionMarkMessage = function(day, level) {
    if (Overtime.isBeforeHireDate(day))
        return Overtime.dayBeforeHireDateTooltip;

    if (Overtime.isAfterReleaseDate(day))
        return Overtime.dayAfterReleaseDateTooltip;

    if (Overtime.isInFuture(day))
        return Overtime.dayInFutureTooltip;

    var calculated = UserTime.formatTimeWithDigitSeparator(Overtime.calculateOvertime(day));
    if (Overtime.disabledInputs[day])
        return messageResource.getMessage("submit_tt.cannot_enter_overtime", [calculated, level]);

    return messageResource.getMessage("submit_tt.overtime_calculated_automaticaly", [Overtime.caption, calculated]);
}

Overtime.getExclamationMarkMessage = function(day) {
    if (Overtime.isBeforeHireDate(day))
        return Overtime.dayBeforeHireDateTooltip;

    if (Overtime.isAfterReleaseDate(day))
        return Overtime.dayAfterReleaseDateTooltip;

    if (Overtime.isInFuture(day))
        return Overtime.dayInFutureTooltip;

    var calculated = UserTime.formatTimeWithDigitSeparator(Overtime.calculateOvertime(day));
    return messageResource.getMessage("submit_tt.overtime_diffed_from_auto", [Overtime.caption, calculated]);
}

Overtime.showQuestionHint = function(day, level, link) {
    Overtime.dhtmlTitle.show(Overtime.getQuestionMarkMessage(day, level), link, Overtime.hintOffsetX, Overtime.hintOffsetY);
}

Overtime.showExclamationHint = function(day, link) {
    Overtime.dhtmlTitle.show(Overtime.getExclamationMarkMessage(day), link, Overtime.hintOffsetX, Overtime.hintOffsetY);
}

Overtime.showDelayedHint = function(day, level, link, func) {
    Overtime.dhtmlTitle.showDelayed(func(day, level), link, Overtime.hintOffsetX, Overtime.hintOffsetY);
}
