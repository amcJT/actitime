/**
 * Cell button is the base class for buttons, that use table cell for highlighting.
 *
 * This button can highlight outter cell, set title, error messages, has three statuses: disabled, invalid, hovered.
 * Hint is empty for disabled button, specified in markAsInvalid for invalid status and specified in constructor for
 * other statuses.
 */


/**
 * Initializes CellButton instance.
 *
 * @param buttonTable - TABLE HTML element that represents this button.
 * @param buttonExternalCell - HTML block element, that outter of the button. It is using for highlighting. Can be null.
 * or undefined if we don't want highlight external element. 
 * @param className is base class name of button TABLE HTML element.
 * @param outerClassName is base class name for button outer block level element. Can be null.
 * @param isDisabled - determines whether the button is disabled.
 */
function CellButton(buttonTable, buttonExternalCell, className, outerClassName, isDisabled, titleElement, hint)
{
    this.buttonTable = buttonTable;
    this.buttonExternalCell = buttonExternalCell;
    this.className = className;
    this.outerClassName = outerClassName;

    this.errorCode = "";
    this.invalid = false;
    this.hovered = false;
    this.pressed = false;
    this.disabled = isDisabled;

    this.errorMessage = "";
    this.titleElement = titleElement;
    this.hint = hint;
}

/**
 * Updates the button contents to show its current state.
 */
CellButton.prototype.updateCssAndTooltip = function()
{
    this.updateCssClass();
    this.updateTooltip();
}

/**
 * Sets title for the button.
 * @param title is text to set as button title.
 */
CellButton.prototype.setTitle = function(title)
{
    this.titleElement.innerHTML = title;
}

/**
 * Sets hint for the button.
 * @param hint is text to set as button hint.
 */
CellButton.prototype.setHint = function(hint)
{
    this.hint = hint;
    this.updateCssAndTooltip();
}

/**
 * Paints the button as invalid.
 */
CellButton.prototype.markAsInvalid = function(errorCode, errorMessage)
{
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;

    this.invalid = true;
    this.updateCssAndTooltip();
};

/**
 * Paints the button as valid.
 */
CellButton.prototype.markAsValid = function()
{
    this.errorCode = "";

    this.invalid = false;
    this.updateCssAndTooltip();
};

/**
 * @return true if the button is disabled, false otherwise
 */
CellButton.prototype.isDisabled = function()
{
    return this.disabled;
};

/**
 * @returns true if button has highlighted with error, false otherwise.
 */
CellButton.prototype.isInvalid = function()
{
    return this.invalid;
}

/**
 * Makes the button appear as pressed.
 */
CellButton.prototype.press = function()
{
    this.pressed = true;
    this.updateCssAndTooltip();
};

/**
 * Makes the button appear as unpressed.
 */
CellButton.prototype.unpress = function()
{
    this.pressed = false;
    this.updateCssAndTooltip();
};

/**
 * Makes the button appear as mouse-hovered (if it is not disabled).
 */
CellButton.prototype.hover = function()
{
    if (this.disabled)
        return;

    this.hovered = true;
    this.updateCssClass();
}

/**
 * Makes the button appear as mouse-unhovered.
 */
CellButton.prototype.unhover = function()
{
    this.hovered = false;
    this.updateCssClass();
}


/**
 * @return id of the HTML TABLE element that represents this button.
 */
CellButton.prototype.getTableId = function()
{
    return this.buttonTable.id;
};


/**
 * Updates the button table CSS class, to reflect the current button status.
 */
CellButton.prototype.updateCssClass = function()
{
    var className = "";

    if (this.isDisabled())
        className += " disabled";

    if (this.pressed)
        className += " pressed";

    if (this.hovered)
        className += " hovered";

    if (this.buttonExternalCell)
        this.buttonExternalCell.className = this.outerClassName + className;

    if (this.invalid)
        className += " invalid";

    this.buttonTable.className = this.className + className;
};

/**
 * Sets disabled status to the button.
 *
 * @param isDisabled - true if disabled, false if enabled.
 */
CellButton.prototype.setDisabled = function(isDisabled)
{
    this.disabled = isDisabled;
    this.updateCssAndTooltip();
}

/**
 * Updates the button's tooltip according to the button's state.
 */
CellButton.prototype.updateTooltip = function()
{
    var text;

    if (this.disabled)
        text = ""
    else if (this.invalid)
        text = this.errorMessage;
    else
        text = this.hint;

    this.buttonTable.title = text;
};
