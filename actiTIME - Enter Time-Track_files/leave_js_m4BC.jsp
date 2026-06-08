

// Enter TT page Leave Info displaying & editing support scripts ---------------------------------------------------------------------------
//
// Requires:
//  leave_type_js.jsp
//  /js/panel_dhtml_popup.js
//  /js/at_js.jsp
//  /js/util.js
//  /js/client_side_errors_js.jsp
//  /js/message_resources.jsp (with 'submit_tt' prefix)
//  /js/ok_cancel_popup.js

// Common definitions -------------------------------------------------------------------------------------------------

/**
 * Leave info for a day.
 * @param leaveType - is {@link LeaveTypeBean} object or null if there's no leave for the day.
 * @param duration - leave duration in minutes. null means full day.
 */
function DayLeaveInfo(leaveType, duration)
{
    this.leaveType = leaveType;
    this.duration = duration;
}

/**
 * Compares two DayLeaveInfo instances.
 */
DayLeaveInfo.prototype.equals = function(otherLeaveInfo)
        {
            if (!otherLeaveInfo)
                return false;

            return (otherLeaveInfo.leaveType == this.leaveType &&
                    otherLeaveInfo.duration == this.duration);
        };


// LeaveButton --------------------------------------------------------------------------------------------------------

LeaveButton.prototype = new CellButton();
LeaveButton.prototype.parentClass = CellButton;

/**
 * A button control for displaying and editing day leave info.
 * @param dayOfWeekNum - day of week number that this button is associated with.
 * @param dayOfWeekName - displayable name of the day of week that this button is associated with.
 * @param isInFuture - true if day is in the future
 * @param buttonTable - TABLE HTML element that represents this button.
 * @param textElementId - HTML element to set the button's dynamic text into
 * @param leaveTypeField - HTML hidden field element used to exchange day leave type data with server.
 *                         Leave type is stored in this field as a string constant defined in LeaveType, or as
 *                         empty string if there's no leave for the day.
 * @param leaveDurationField - HTML hidden field element used to exchange day leave duration data with server.
 *                             Leave duration is stored in this field as a number of minutes, or as '-1' for full-day
 *                             leaves.
 * @param iconDiv - HTML DIV element with time off icon inside.
 * @param icon - HTML IMG element with time-off icon.
 * @param onChangeHandler - a pointer to the function that will be executed when the data in the button is changed.
 *                          The day of week number will be passed to this function as a parameter.
 * @param isDisabled - determines whether the button is disabled.
 * @param isNonWorkingDay - determines whether this day is non-working
 * @param workdayDuration - working day duration in minutes
 * @param isToday - true if day is today
 */
function LeaveButton(dayOfWeekNum, dayOfWeekName, isInFuture, buttonTable, textElementId, leaveTypeField, leaveDurationField,
                     iconDiv, icon, onChangeHandler, isDisabled, isNonWorkingDay, workdayDuration, isToday)
{
    this.parentClass(buttonTable, null, "leaveButton", null, isDisabled, textElementId)

    this.dayOfWeekNum = dayOfWeekNum;
    this.dayOfWeekName = dayOfWeekName;
    this.isInFuture = isInFuture;
    this.textElementId = textElementId;
    this.leaveTypeField = leaveTypeField;
    this.leaveDurationField = leaveDurationField;
    this.iconDiv = iconDiv;
    this.icon = icon;
    this.onChangeHandler = onChangeHandler;
    this.changed = false;
    this.isNonWorkingDay = isNonWorkingDay;
    this.workdayDuration = workdayDuration;
    this.isToday = isToday;

    var parsedLeaveType = parseInt(this.leaveTypeField.value);
    var parsedDuration = parseInt(this.leaveDurationField.value);

    this.dayLeaveInfo = new DayLeaveInfo( parsedLeaveType > 0 ? LeaveTypesList.getLeaveTypeById(parsedLeaveType) : null,
                                          parsedDuration > 0 ? parsedDuration : null);

    this.update();
}

/**
 * @returns the DayLeaveInfo object that contains the current button state.
 */
LeaveButton.prototype.getDayLeaveInfo = function()
        {
            return this.dayLeaveInfo;
        };

/**
 * Sets the leave info into the button. The button contents will be updated to represent the new state.
 * Also, the onChangeHandler will be invoked.
 * NB! This method doesn nothing if nothing was changed.
 * @param dayLeaveInfo - the DayLeaveInfo object that contains the new button state.
 */
LeaveButton.prototype.setDayLeaveInfo = function(dayLeaveInfo)
        {
            if (this.getDayLeaveInfo().equals(dayLeaveInfo))
                return;

            this.dayLeaveInfo = dayLeaveInfo;
            this.leaveTypeField.value = dayLeaveInfo.leaveType == null ? "0" : dayLeaveInfo.leaveType.id;
            this.leaveDurationField.value = dayLeaveInfo.duration == null ? "-1" : dayLeaveInfo.duration;
            this.changed = true;
            this.update();

            if (this.onChangeHandler)
                this.onChangeHandler(this.dayOfWeekNum);
        };

/**
 * Updates the button contents to show its current state.
 */
LeaveButton.prototype.update = function()
        {
            var text;

            if (this.dayLeaveInfo.duration != null)
            {
                this.iconDiv.style.display = "";

                if (this.dayLeaveInfo.leaveType != null)
                {
                    this.icon.src = this.dayLeaveInfo.leaveType.iconUrl;
                    this.icon.alt = this.dayLeaveInfo.leaveType.name;
                    if(document.isPNGFixing)
                        fixTransparencyForImage(this.icon);
                }
                else
                {
                    this.icon.src = "/img/default/pixel.gif?hash=797059755";
                    this.icon.alt = "";
                }

                this.icon.title = this.icon.alt;

                if ( (this.dayLeaveInfo.duration != null && this.dayLeaveInfo.duration != this.workdayDuration) ||
                     (this.dayLeaveInfo.leaveType == null) || (this.dayLeaveInfo.leaveType.wholeDayText == "") )
                    text = UserTime.formatTime(this.dayLeaveInfo.duration);
                else
                    text = this.dayLeaveInfo.leaveType.wholeDayText;
            }
            else
            {
                hideElement(this.iconDiv);

                if (this.isNonWorkingDay)
                    text = messageResource.getMessage("submit_tt.leave.button.nonworking_day");
                else
                    text = messageResource.getMessage("submit_tt.leave.button.workday");
            }

          this.setTitle(text)
          this.updateCssAndTooltip();
        };

/**
 * @return true if the button state (i.e. day leave info) was changed since the button was created.
 */
LeaveButton.prototype.isChanged = function()
        {
            return this.changed;    
        };

/**
 * Sets the 'changed' flag to the specified value.
 * Although this flag is set automatically when there are changes,
 * it is sometimes necessary to set it manually.
 * @param changed - true or false
 */
LeaveButton.prototype.setChanged = function(changed)
        {
            this.changed = changed;    
        };

/**
 * @return weekday number of this button
 */
LeaveButton.prototype.getDayOfWeekNum = function()
        {
            return this.dayOfWeekNum;
        };

/**
 * Updates the button table CSS class, to reflect the current button status.
 */
LeaveButton.prototype.updateCssClass = function()
        {
            CellButton.prototype.updateCssClass.call(this);

            var className = this.buttonTable.className;

        /* TODO: CSS selectors with chained classes are not supported in IE6 and other IEs in IE6 compatibility mode.
                 So it's a risky code below. */

            var nonWorkingClass;
            var workingClass;

            if (this.isToday)
            {
                nonWorkingClass = " nonworking_today";
                workingClass = " today";
            }
            else
            {
                nonWorkingClass = " nonworking";
                workingClass = "";
            }

            if (this.dayLeaveInfo.leaveType != null)
            {
                this.buttonTable.style.backgroundColor = this.dayLeaveInfo.leaveType.iconBackgroundColor;

                className += nonWorkingClass;
            }
            else
            {
                this.buttonTable.style.backgroundColor = "";

                if (this.isNonWorkingDay)
                    className += nonWorkingClass;
                else
                    className += workingClass;
            }

            this.buttonTable.className = className;
        };

/**
 * Updates the button's tooltip according to the button's state.
 */
LeaveButton.prototype.updateTooltip = function()
        {
            var text;

            text = "";

            if (this.isDisabled())
                text = messageResource.getMessage("submit_tt.leave.button.tooltip.locked",
                                                  [this.dayOfWeekName]);
            else if (this.invalid)
            {
                if (this.errorCode == "submit_tt.leave.button.tooltip.error_time_exceeds_workday_duration")
                    text = messageResource.getMessage(this.errorCode, [UserTime.formatTime(this.workdayDuration)]);
                
                else if (this.errorCode == "submit_tt.leave.error_leave_type_unavailable")
                    text = messageResource.getMessage(this.errorCode);
            }
            else if (!this.pressed)
            {
				if (this.dayLeaveInfo.leaveType)
				{
					text = this.dayLeaveInfo.leaveType.name;
				}
				else
				{
					text = messageResource.getMessage("submit_tt.leave.button.tooltip.click_to_enter");
				}
            }

            this.buttonTable.title = text;
        };


// LeavePopup ---------------------------------------------------------------------------------------------------------

/**
 * A popup panel control for editing day leave info.
 * Only one instance of this control may exist on a page.
 */
var LeavePopup = {};

/**
 * Initializes the popup panel control.
 * @param timeOffField - HTML field for editing time off.
 * @param leaveTypeSelect - HTML select for choosing leave type.
 * @param noLeaveRadioButton - HTML radio button for 'no time off' choice.
 * @param timeOffRadioButton - HTML radio button for 'time off' choice.
 * @param errorMessageOuterElement - HTML element used to display error messages.
 *                                   This one will be shown/hidden when needed.
 * @param errorMessageInnerElement - HTML element used to display error messages.
 *                                   The message text will be set into this element.
 * @param noTimeOffLabel - HTML label for no time off field
 * @param noTimeOffElementsToChangeColor - array with HTML elements for settings color style to. Can be null.
 * @param timeOffIcon - HTML IMG element to set current time off image to.
 * @param wholeDayLink - HTML element that contains link for filling whole day value to the time off field
 * @param wholeDayInactiveLink - HTML element that contains text visible instead of wholeDayLink when there are
 * no timeoffs.
 * @param messageBlockDiv - HTML DIV element with block for showing info messages.
 * @param messageTextDiv - HTML DIV element with block for showing info messages.
 * @param cancelButtonBlock = HTML block element with cancel button element.
 * @param workdayDuration - workday duration in minutes.
 * @param popupWidth - popup width in pixels
 */
LeavePopup.init = function(timeOffField, leaveTypeSelect, noLeaveRadioButton, timeOffRadioButton,
                           errorMessageOuterElement, errorMessageInnerElement,
                           noTimeOffLabel, noTimeOffElementsToChangeColor, timeOffIcon, wholeDayLink, wholeDayLinkInactive,
                           messageDiv, messageTextDiv, cancelButtonBlock,
                           workdayDuration, popupWidth)
        {
            LeavePopup.timeOffField = timeOffField;
            LeavePopup.leaveTypeSelect = leaveTypeSelect;
            LeavePopup.noTimeOffLabel = noTimeOffLabel;
            LeavePopup.timeOffIcon = timeOffIcon;
            LeavePopup.noTimeOffElementsToChangeColor = noTimeOffElementsToChangeColor;
            LeavePopup.messageDiv = messageDiv;
            LeavePopup.messageTextDiv = messageTextDiv;
            LeavePopup.wholeDayLink = wholeDayLink;
            LeavePopup.wholeDayLinkInactive = wholeDayLinkInactive;
            LeavePopup.cancelButtonBlock = cancelButtonBlock;

            LeavePopup.MSG_NO_LEAVES_IN_FUTURE = messageResource.getMessage("submit_tt.message.cannot_enter.no_planned");
            LeavePopup.MSG_NO_LEAVES_NOW_OR_PAST = messageResource.getMessage("submit_tt.message.cannot_enter.no_enabled");

            LeavePopup.MSG_INCORRECT_TIME_TOOLTIP = messageResource.getMessage("submit_tt.error_invalid_tt", [SystemSettings.decimalSeparator]);
            LeavePopup.MSG_INCORRECT_TIME_LABEL = messageResource.getMessage("submit_tt.error_invalid_tt_for_label", [SystemSettings.decimalSeparator]);

            LeavePopup.MSG_MISSING_LEAVE_TYPE_TOOLTIP = messageResource.getMessage("submit_tt.leave.error_leave_type_unavailable");

            var formattedWorkdayDuration = UserTime.formatTime(workdayDuration);

            LeavePopup.MSG_TIME_EXCEEDS_WORKDAY = messageResource.getMessage("submit_tt.leave.error_timeoff_exceeds_workday_duration",
                    [formattedWorkdayDuration]);

            LeavePopup.MSG_MISSING_TIME_NAME = "submit_tt.leave.error_missing_time";
            LeavePopup.MSG_MISSING_LEAVE_TYPE_NAME = "submit_tt.leave.error_leave_type_unavailable";

            LeavePopup.ERROR_INCORRECT_TIME = "incorrect_time";
            LeavePopup.ERROR_MISSING_LEAVE_TYPE = "missing_leave_type";
            LeavePopup.ERROR_MISSING_TIME = "missing_time";
            LeavePopup.ERROR_TIME_EXCEEDS_WORKDAY = "time_exceeds_workday";

            LeavePopup.leavePopup = new OkCancelPopup("LeavePopup", "leavePopupTable", errorMessageOuterElement, errorMessageInnerElement);

            LeavePopup.leavePopup.setOnOkClickHandler( LeavePopup.validateAndSave );

            LeavePopup.pressedButton = null;

            LeavePopup.errorMessageOuterElement = errorMessageOuterElement;
            LeavePopup.errorMessageInnerElement = errorMessageInnerElement;
            LeavePopup.workdayDuration = workdayDuration;

            LeavePopup.popupWidth = popupWidth;

            LeavePopup.NO_LEAVE_RADIO_BUTTON = "LeavePopupRadio_NoLeave";
            LeavePopup.TIME_OFF_RADIO_BUTTON = "LeavePopupRadio_TimeOff";
            
            LeavePopup.radioButtons = new Object();
            LeavePopup.radioButtons[LeavePopup.NO_LEAVE_RADIO_BUTTON] = noLeaveRadioButton;
            LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON] = timeOffRadioButton;

            LeavePopup.leavePopup.setAfterHideHandler(function()
                {
                    LeavePopup.pressedButton.unpress();
                    LeavePopup.pressedButton = null;
                    KeyDownHandler.restoreOnKeyDownHandler();
                });

            LeavePopup.beforeShowHandler = null;

            LeavePopup.lastValidationResult = "";

            LeavePopup.lastSelectedLeaveType = null;
        };

/**
 * Updates the state of the radio buttons and text fields, according to the given day leave info.
 * @param dayLeaveInfo - the DayLeaveInfo object that contains the new state info.
 */
LeavePopup.updateState = function(dayLeaveInfo)
        {
            if ( (dayLeaveInfo.leaveType != null) || (dayLeaveInfo.duration > 0) ) {
                LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON].checked = true;
            } else {
                LeavePopup.radioButtons[LeavePopup.NO_LEAVE_RADIO_BUTTON].checked = true;
            }

             LeavePopup.noTimeOffLabel.innerHTML = messageResource.getMessage("submit_tt.leave.radio.no_leave",
                                                                           [LeavePopup.pressedButton.dayOfWeekName]);

             if (dayLeaveInfo.duration == null)
                LeavePopup.timeOffField.value = "";
             else
                LeavePopup.timeOffField.value = UserTime.formatTime(dayLeaveInfo.duration);
        };

/**
 * Shows the panel.
 * Before showing the panel, its radiobuttons and fields are updated according to the pressed leave button state.
 * @param pressedButton - the button which was pressed (a LeaveButton object).
 */
LeavePopup.show = function(pressedButton)
        {
            if (LeavePopup.beforeShowHandler)
            {
                if (!LeavePopup.beforeShowHandler())
                {
                    return;
                }
            }

            if (LeavePopup.leavePopup.isVisible())
                LeavePopup.leavePopup.hide();

            LeavePopup.lastValidationResult = "";
            LeavePopup.pressedButton = pressedButton;
            LeavePopup.updateState(pressedButton.dayLeaveInfo);
            LeavePopup.leavePopup.setPositioningStrategy(new ElementRelativePositioning(pressedButton.getTableId()));

            LeavePopup.unmarkInvalidFieldsAndHideErrorMessage();

            pressedButton.press();

            var offsetX = -1;
            var offsetY = getObjectHeight(pressedButton.getTableId());
            LeavePopup.leavePopup.show(offsetX, offsetY, LeavePopup.popupWidth, null, false);

            var selectedLeaveTypeId;

            var dayInfo;

            dayInfo = LeavePopup.pressedButton.dayLeaveInfo;

            if (dayInfo.leaveType != null) {
                selectedLeaveTypeId = dayInfo.leaveType.id;
            } else if (LeavePopup.lastSelectedLeaveType &&
                       LeavePopup.leaveTypeIsValid(LeavePopup.lastSelectedLeaveType)) {
                selectedLeaveTypeId = LeavePopup.lastSelectedLeaveType.id;
            } else {
                selectedLeaveTypeId = null;
            }

            LeavePopup.fillActualLeaveTypes( selectedLeaveTypeId, (dayInfo.leaveType == null) && (dayInfo.duration > 0) );

            if (LeavePopup.leaveTypeSelect.options.length == 0)
            {
                LeavePopup.setLeaveTypeInputsEnabled(false);

                hideElement(LeavePopup.cancelButtonBlock);

                if (LeavePopup.pressedButton.isInFuture)
                    LeavePopup.showMessage(LeavePopup.MSG_NO_LEAVES_IN_FUTURE);
                else
                    LeavePopup.showMessage(LeavePopup.MSG_NO_LEAVES_NOW_OR_PAST);
            }
            else
            {
                LeavePopup.setLeaveTypeInputsEnabled(true);
                LeavePopup.hideMessage();
                LeavePopup.cancelButtonBlock.style.display = "";
            }

            LeavePopup.updateTimeOffIcon();

            LeavePopup.validateSelectionAndShowErrors(false);
        };


/**
 * Shows specified message before buttons block
 * @param text is message text to show.
 */
LeavePopup.showMessage = function(text)
        {
            LeavePopup.messageDiv.style.display = "";
            LeavePopup.messageTextDiv.innerHTML = text;
        }

LeavePopup.setLeaveTypeInputsEnabled = function(isEnabled)
{
    LeavePopup.leaveTypeSelect.disabled = !isEnabled;
    LeavePopup.timeOffField.disabled = !isEnabled;

    LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON].disabled = !isEnabled;

    if (LeavePopup.noTimeOffElementsToChangeColor != null)
    {
        for(var i=0;i<LeavePopup.noTimeOffElementsToChangeColor.length;i++)
        {
            LeavePopup.noTimeOffElementsToChangeColor[i].className = isEnabled ? "" : "grayed";
        }
    }

    LeavePopup.wholeDayLink.style.display = isEnabled ? "" : "none";
    LeavePopup.wholeDayLinkInactive.style.display = ! isEnabled ? "" : "none";

    if (!isEnabled)
    {
        LeavePopup.radioButtons[LeavePopup.NO_LEAVE_RADIO_BUTTON].checked = true;
        LeavePopup.timeOffField.value = "";
    }
}

/**
 * Hides message before buttons block
 */
LeavePopup.hideMessage = function()
        {
            hideElement(LeavePopup.messageDiv);
        }

/**
 * Validates the current selection.
 * And also, reformats the entered leave duration.
 * @return null if no errors, or one of string constants:
 *   LeavePopup.ERROR_INCORRECT_TIME
 *   LeavePopup.ERROR_MISSING_TIME
 *   LeavePopup.ERROR_TIME_EXCEEDS_WORKDAY
 */
LeavePopup.validateSelection = function()
        {
            // no leave selection is always valid.
            if (LeavePopup.radioButtons[LeavePopup.NO_LEAVE_RADIO_BUTTON].checked)
                return null;


            var leaveInfo = LeavePopup.getCurrentLeaveInfo();
            var field = LeavePopup.timeOffField;

            if (leaveInfo.leaveType == null) // if leave type is missing
            {
                return LeavePopup.ERROR_MISSING_LEAVE_TYPE;
            }
            else if (leaveInfo.duration == null) // if duration could not be parsed
            {
                return LeavePopup.ERROR_INCORRECT_TIME;
            }
            else
            {
                // Reformat the entered value
                if (!(trim(field.value) == "")) // but only if the field is not empty
                {
                    var newValue = UserTime.formatTime(leaveInfo.duration);
                    if (newValue != field.value) // and do not set it if it won't be changed, to avoid jumping cursor
                        field.value = newValue;
                }

                if (leaveInfo.duration == 0)
                {
                    return LeavePopup.ERROR_MISSING_TIME;
                }

                if (leaveInfo.duration > LeavePopup.workdayDuration)
                {
                    return LeavePopup.ERROR_TIME_EXCEEDS_WORKDAY;
                }
            }

            return null;
        };

/**
 * Validates the current selection and if failed then marks the corresponding field as invalid.
 * Note that LeavePopup.ERROR_MISSING_TIME is ignored.
 * Hides the current error message and invalid field mark, if present.
 * @param doNothingIfNotChanged - if true and the current validation result doesn't differ from the previous,
 *   then the function will do nothing (i.e. it will not hide the error message and invalid field mark, even if it is
 *   LeavePopup.ERROR_MISSING_TIME).
 */
LeavePopup.validateSelectionAndShowErrors = function(doNothingIfNotChanged)
        {
            var validationResult = LeavePopup.validateSelection();

            if (doNothingIfNotChanged && (validationResult == LeavePopup.lastValidationResult))
                    return;

            LeavePopup.unmarkInvalidFieldsAndHideErrorMessage();
            LeavePopup.lastValidationResult = validationResult;

            if (!validationResult)
                return;

            switch (validationResult)
            {
                case LeavePopup.ERROR_INCORRECT_TIME:
                    ClientSideErrors.paintElementAsInvalid(
                            LeavePopup.timeOffField,
                            LeavePopup.MSG_INCORRECT_TIME_TOOLTIP);
                    break;

                case LeavePopup.ERROR_MISSING_LEAVE_TYPE:
                    ClientSideErrors.markSelectFieldAsInvalid(
                            LeavePopup.leaveTypeSelect,
                            LeavePopup.MSG_MISSING_LEAVE_TYPE_TOOLTIP, true);
                    break;

                case LeavePopup.ERROR_TIME_EXCEEDS_WORKDAY:
                    ClientSideErrors.paintElementAsInvalid(
                            LeavePopup.timeOffField,
                            LeavePopup.MSG_TIME_EXCEEDS_WORKDAY);
                    break;
            }
        };

/**
 * Should be called when the user changes a value in a time off text field.
 * Revalidates the selection.
 */
LeavePopup.onTimeOffFieldChange = function()
        {
            LeavePopup.validateSelectionAndShowErrors(true);
        };

/**
 * Gets selected leave type OR null if nothing selected.
 */
LeavePopup.getSelectedLeaveType = function()
{
    if (LeavePopup.leaveTypeSelect.selectedIndex == -1)
        return null;

    var leaveTypeId;
    leaveTypeId =  LeavePopup.leaveTypeSelect.options[LeavePopup.leaveTypeSelect.selectedIndex].value;
    
    return LeaveTypesList.getLeaveTypeById(leaveTypeId);
}

/**
 * Updates icon with selected leave type in the popup select html element.
 */
LeavePopup.updateTimeOffIcon = function()
        {
            var leaveType;

            leaveType = LeavePopup.getSelectedLeaveType();

            if (leaveType != null)
            {
                LeavePopup.timeOffIcon.style.display = "";
                LeavePopup.timeOffIcon.src = leaveType.iconUrl;
                if(document.isPNGFixing)
                    fixTransparencyForImage(LeavePopup.timeOffIcon);
            }
            else
            {
                LeavePopup.timeOffIcon.style.display = "";
                LeavePopup.timeOffIcon.src = "/img/default/pixel.gif?hash=797059755";
            }
        };

/**
 * Should be called when leave type selection changed.
 */
LeavePopup.onLeaveTypeChange = function()
    {
            LeavePopup.updateTimeOffIcon();

            LeavePopup.validateSelectionAndShowErrors(false);
    }

/**
 * Should be called when a time off text field receives focus.
 * Automatically selects the corresponding radio button and revalidates the selection.
 */
LeavePopup.onTimeOffFieldFocus = function()
        {
            LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON].checked = true;

            LeavePopup.validateSelectionAndShowErrors(true);
        };

/**
 * Should be called when the user clicks a radio button.
 * Automatically focuses the corresponding time off field (if time off radio button selected) and
 * revalidates the selection.
 */
LeavePopup.onLeaveRadioButtonClick = function()
        {
            if (LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON].checked)
            {
                this.timeOffField.focus();
            }
            
            LeavePopup.validateSelectionAndShowErrors(true);
        };

/**
 * Should be called when the user clicks the 'whole day' link.
 * Automatically selects the corresponding radio button, focuses the time off field and sets
 * the workday duration into it.
 */
LeavePopup.onWholeDayLinkClick = function()
        {
            LeavePopup.timeOffField.value = UserTime.formatTime(LeavePopup.workdayDuration);
            LeavePopup.validateSelectionAndShowErrors(false);
            LeavePopup.timeOffField.focus();
        };


/**
 * Returns the DayLeaveInfo object representing the leave info currently entered in the popup.
 * @return the DayLeaveInfo object or null if the entered duration could not be parsed
 */
LeavePopup.getCurrentLeaveInfo = function()
        {
            var leaveType;

            leaveType = LeavePopup.getSelectedLeaveType();

            if (LeavePopup.radioButtons[LeavePopup.TIME_OFF_RADIO_BUTTON].checked)
            {
                var leaveDuration;
                leaveDuration = UserTime.parseTime(LeavePopup.timeOffField.value);

                if (spentTimeIsInvalid(leaveDuration))
                    leaveDuration = null;

                return new DayLeaveInfo(leaveType, leaveDuration);
            }
            else
                return new DayLeaveInfo(null, null);
        };


/**
 * Clicks 'Ok' at the popup, so it closes if all entered data in popup correct or shows errors. 
 */
LeavePopup.hide = function()
{
    if ( (LeavePopup.leavePopup != null) && (LeavePopup.leavePopup.isVisible()) )
        LeavePopup.leavePopup.clickOk();
}

/**
 * Tries to save the info and close the popup panel.
 * Performs fields validation and marks them as invalid and shows error message if the validation fails.
 * If validation passes, updates the LeaveButton state according to the current popup state and hides the popup.
 * @return true on success, false if validation failed
 */
LeavePopup.validateAndSave = function()
        {
            if (LeavePopup.pressedButton)
            {
                LeavePopup.unmarkInvalidFieldsAndHideErrorMessage();

                var leaveInfo = LeavePopup.getCurrentLeaveInfo();

                var validationResult = LeavePopup.validateSelection();

                LeavePopup.lastValidationResult = validationResult;

                if (validationResult)
                {
                    var select;
                    select = LeavePopup.leaveTypeSelect;

                    var message;

                    switch (validationResult)
                    {
                        case LeavePopup.ERROR_INCORRECT_TIME:
                            LeavePopup.markFieldAsInvalidAndShowErrorMessage(
                                    LeavePopup.timeOffField,
                                    LeavePopup.MSG_INCORRECT_TIME_TOOLTIP,
                                    LeavePopup.MSG_INCORRECT_TIME_LABEL,
                                    false);
                            return false;

                        case LeavePopup.ERROR_MISSING_LEAVE_TYPE:
                        {
                            message = messageResource.getMessage(LeavePopup.MSG_MISSING_LEAVE_TYPE_NAME);
                            LeavePopup.markFieldAsInvalidAndShowErrorMessage(select, message, message, true);
                            return false;
                        }
                        
                        case LeavePopup.ERROR_MISSING_TIME:
                        {
                            message = messageResource.getMessage(LeavePopup.MSG_MISSING_TIME_NAME,
                                    [ escapeHtmlSymbols(select.options[select.selectedIndex].text.toLowerCase()) ]);
                            LeavePopup.markFieldAsInvalidAndShowErrorMessage(
                                    LeavePopup.timeOffField,
                                    message, message, false);
                            return false;
                        }

                        case LeavePopup.ERROR_TIME_EXCEEDS_WORKDAY:
                            LeavePopup.markFieldAsInvalidAndShowErrorMessage(
                                    LeavePopup.timeOffField,
                                    LeavePopup.MSG_TIME_EXCEEDS_WORKDAY,
                                    LeavePopup.MSG_TIME_EXCEEDS_WORKDAY,
                                    false);
                            return false;
                    }
                }
                if(!LeavePopup.pressedButton.getDayLeaveInfo().equals(leaveInfo))
                    LeavePopup.lastSelectedLeaveType = leaveInfo.leaveType;
                LeavePopup.pressedButton.setDayLeaveInfo(leaveInfo);
            }

            return true;
        };


/**
 * Marks field as invalid and shows the error message.
 * @param field - HTML field to mark as invalid
 * @param tooltipText - tooltip text for the field
 * @param messageText - error message text
 */
LeavePopup.markFieldAsInvalidAndShowErrorMessage = function(field, tooltipText, messageText, isSelectField)
        {
            if(isSelectField == undefined || !isSelectField )
            {
                ClientSideErrors.paintElementAsInvalid(field, tooltipText);
            }
            else
            {
                ClientSideErrors.markSelectFieldAsInvalid(field, tooltipText, true);
            }

            LeavePopup.leavePopup.showErrorMessage(messageText);
        };

/**
 * Unmarks field previously marked as invalid and hides the error message.
 */
LeavePopup.unmarkInvalidFieldsAndHideErrorMessage = function()
        {
            ClientSideErrors.paintElementAsValid(LeavePopup.timeOffField);
            ClientSideErrors.markSelectFieldAsValid(LeavePopup.leaveTypeSelect);

            LeavePopup.leavePopup.hideErrorMessage();
        };

/**
 * @return true if the popup is opened and some info in it was changed
 */
LeavePopup.isOpenedAndChanged = function()
        {
            if (!LeavePopup.pressedButton)
                return false;

            var leaveInfo = LeavePopup.getCurrentLeaveInfo();

            return !LeavePopup.pressedButton.getDayLeaveInfo().equals(leaveInfo);
        };

/**
 * @return weekday number of the currently opened popup. If popup is not opened, returns null.
 */
LeavePopup.getOpenedDayNumber = function()
        {
            if (LeavePopup.pressedButton)
                return LeavePopup.pressedButton.getDayOfWeekNum();
            return null;
        };

/**
 * Sets the handler for the event fired just before the popup is shown.
 * If the handler returns false, then the popup won't be shown.
 * @param handler - handler for the beforeShow event
 */
LeavePopup.setBeforeShowHandler = function(handler)
        {
            LeavePopup.beforeShowHandler = handler;    
        };

/**
 * Fills actual leave types into leave types select field.
 * 
 * @param selectedLeaveTypeId is leave type id to select in filled select. Can be undefined or null.
 * @param forceEmptyOption is true when we need to add 'please select option' and select it.
 * @returns true if user's leave type was not found in available leave types 
 */
LeavePopup.fillActualLeaveTypes = function(selectedLeaveTypeId, forceEmptyOption)
{
    var select = LeavePopup.leaveTypeSelect;
    select.options.length = 0;

    var j;

    var selectedIndex;
    selectedIndex = 0;

    var userSelectionNotFound;
    userSelectionNotFound = false;

    if (selectedLeaveTypeId > 0)
    {
        var userSelectionIndex;
        userSelectionIndex = -1;

        j = 0;
        for(var i=0;i<LeaveTypesList.leaveTypes.length;i++)
        {
                if (LeavePopup.leaveTypeIsValid(LeaveTypesList.leaveTypes[i]) )
                {
                    if (LeaveTypesList.leaveTypes[i].id == selectedLeaveTypeId)
                    {
                       userSelectionIndex = j;
                       break;
                    }
                    j++;
                }
        }

        if (userSelectionIndex == -1)
        {
            userSelectionNotFound = true;
        }
        else
        {
            selectedIndex = userSelectionIndex;
        }
    }

    if (userSelectionNotFound || forceEmptyOption)
    {
        select.options.add(new Option(" - please select - ", -1));
        selectedIndex = 0;
    }

    j = 0;
    for(i=0;i<LeaveTypesList.leaveTypes.length;i++)
    {
            if (LeavePopup.leaveTypeIsValid(LeaveTypesList.leaveTypes[i]))
            {
                  select.options.add(new Option(LeaveTypesList.leaveTypes[i].name, LeaveTypesList.leaveTypes[i].id));
                  j++;
            }
    }

    select.selectedIndex = selectedIndex;
}

/**
 * Validates leave type. Leave type is valid when it is active and not unplanned if the day is in a future.
 *
 * @param leaveType is leave type Object to check, not null, not undefined.
 * @return true if specified leave type is valid.
 */
LeavePopup.leaveTypeIsValid = function(leaveType)
{
  return leaveType.isActive &&
         ( leaveType.isPlanned || (!LeavePopup.pressedButton.isInFuture && !leaveType.isPlanned) );
}

// LeaveButtons -------------------------------------------------------------------------------------------------------

/**
 * Maintains a collection of the LeaveButton objects.
 */
var LeaveButtons = {};
LeaveButtons.buttons = [];

/**
 * Adds a button to the collection.
 * @param leaveButton - a LeaveButton object to add.
 */
LeaveButtons.addButton = function(leaveButton)
        {
            LeaveButtons.buttons[leaveButton.dayOfWeekNum] = leaveButton;
        };

/**
 * Should be called when a button is clicked. Shows the popup panel for the given day.
 * If the popup panel is already shown, then tries to close it applying changes,
 * and if succeeds, then shows the popup for the new day (or does nothing if the popup was shown for the same day).
 * If unsuccessful, then does nothing.
 *
 * If the requested day is locked, then does nothing.
 *
 * @param dayOfWeekNum - weekday number that the clicked button is associated with 
 */
LeaveButtons.onClick = function(dayOfWeekNum)
        {
            if (LeaveButtons.buttons[dayOfWeekNum].isDisabled())
                return;

            var openedDay = LeavePopup.getOpenedDayNumber();

            if (!LeavePopup.validateAndSave())
                return;
            else
                LeavePopup.leavePopup.hide();

            if (openedDay != dayOfWeekNum)
                LeavePopup.show(LeaveButtons.buttons[dayOfWeekNum]);
        };

/**
 * Should be called on a button's MouseOver event.
 * Renders the button as hovered.
 */
LeaveButtons.onMouseOver = function(dayOfWeekNum)
        {
            LeaveButtons.buttons[dayOfWeekNum].hover();    
        };

/**
 * Should be called on a button's MouseOut event.
 * Renders the button as unhovered.
 */
LeaveButtons.onMouseOut = function(dayOfWeekNum)
        {
            LeaveButtons.buttons[dayOfWeekNum].unhover();    
        };


/**
 * @param dayOfWeekNum - weekday number of the day for which to retrieve leave time.
 * @return leave time in minutes for the day. The info is taken from the corresponding LeaveButton object.
 *         Returns null for full day leave. Returns 0 for no leave.
 */
LeaveButtons.getLeaveTimeForDay = function(dayOfWeekNum)
        {
            //leave button is null if leaves were disabled
            var leaveButton = LeaveButtons.buttons[dayOfWeekNum];
            if (leaveButton == null)
                return 0;

            var leaveInfo = leaveButton.getDayLeaveInfo();
            if (leaveInfo.leaveType == null)
                return 0;
            else
                return leaveInfo.duration;
        };

/**
 * Checks whether the leave info for the day was changed by user since the page was loaded. 
 * @param dayOfWeekNum - weekday number
 * @return true if changed, false otherwise
 */
LeaveButtons.isLeaveInfoChanged = function(dayOfWeekNum)
        {
            var leaveButton = LeaveButtons.buttons[dayOfWeekNum];
            if (leaveButton != null)
                return leaveButton.isChanged();
            else
                return false;
        };

/**
 * Sets the 'changed' flag of the given day to the specified value.
 * Although this flag is set automatically when there are changes,
 * it is sometimes necessary to set it manually.
 * @param dayOfWeekNum - weekday number
 * @param changed - true or false
 */
LeaveButtons.setDayChanged = function(dayOfWeekNum, changed)
        {
            LeaveButtons.buttons[dayOfWeekNum].setChanged(changed);    
        };

/**
 * Checks whether there are leave info changes for any of the days.
 * @return true if there are changes, false otherwise
 */
LeaveButtons.hasChanges = function()
        {
            for (var i in LeaveButtons.buttons)
            {
                if (LeaveButtons.buttons[i].isChanged())
                    return true;
            }
            return false;
        };

/**
 * Paints the button for the day as invalid.
 * @param dayOfWeekNum - weekday number
 */
LeaveButtons.markButtonAsInvalid = function(dayOfWeekNum, errorCode)
        {
            var leaveButton = LeaveButtons.buttons[dayOfWeekNum];
            if (leaveButton != null)
                leaveButton.markAsInvalid(errorCode);
        }

/**
 * Paints the button for the day as valid.
 * @param dayOfWeekNum - weekday number
 */
LeaveButtons.markButtonAsValid = function(dayOfWeekNum)
        {
            var leaveButton = LeaveButtons.buttons[dayOfWeekNum];
            if (leaveButton != null)
                leaveButton.markAsValid();
        }
