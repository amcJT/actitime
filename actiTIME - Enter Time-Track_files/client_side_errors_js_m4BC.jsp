


function ClientSideErrors() {}

ClientSideErrors.errorHighlightColor = "#ff2000";
ClientSideErrors.errorMessageWasShown = false;
ClientSideErrors.canSetInvalidFieldInFocus = true;
ClientSideErrors.isFocusingFirstFieldOnErrorEnabled = false;

ClientSideErrors.markTextFieldAsInvalid = function(field, errorTitle, errorClass)
{
    ClientSideErrors.paintElementAsInvalid(field, errorTitle, errorClass);
    ClientSideErrors.registerFieldError(field.name);
    ClientSideErrors.setInvalidFieldInFocus(field);
}

/*
 * Marks the specified select control as invalid. To do it the select should be nested in SPAN tag. Function adds red
 * border to this SPAN and adds error tooltip to the select control.
 */
ClientSideErrors.markSelectFieldAsInvalid = function(field, errorTitle, dontChangeParentWidth)
{
    if (!dontChangeParentWidth)
        field.parentNode.style.width = field.clientWidth + 4;

    ClientSideErrors.paintElementAsInvalid(field.parentNode, errorTitle);
    ClientSideErrors.registerFieldError(field.name);
    ClientSideErrors.setInvalidFieldInFocus(field);
}

ClientSideErrors.paintElementAsInvalid = function(field, errorTitle, errorClass)
{
    if(field)
    {
        field.style.borderColor = ClientSideErrors.errorHighlightColor;
        field.style.borderStyle = "solid";
        field.style.borderWidth = "2px";
        field.title = errorTitle;
        field.style.color = '';
        if(errorClass)
            addClass( field, errorClass );
    }
}

/**
 * @param keepBorder - specifies color to set at element border.
 */
ClientSideErrors.paintElementAsValid = function(field, keepBorderColor, errorClass)
{
    if(field)
    {
        if (keepBorderColor != undefined)
        {
            field.style.borderColor = keepBorderColor;
        }
        else
        {
            field.style.borderColor = "";
            field.style.borderStyle = "";
            field.style.borderWidth = "";
        }
        field.title = '';
        if(errorClass)
            removeClass( field, errorClass );
    }
}

ClientSideErrors.markTextFieldAsValid = function(field, errorClass)
{
    if(field)
    {
        if(!fieldErrors[field.name]) return;
        ClientSideErrors.paintElementAsValid(field, null, errorClass);
        ClientSideErrors.unregisterFieldError(field.name);
    }
}

/*
 * Marks the specified select control as valid. For additional information see ClientSideErrors.markSelectFieldAsInvalid.
 *
 * @param keepBorder - specifies color to set at element border.
 */
ClientSideErrors.markSelectFieldAsValid = function(field, keepBorderColor)
{
    if(field)
    {
        if(!fieldErrors[field.name]) return;
        ClientSideErrors.paintElementAsValid(field.parentNode, keepBorderColor);
        ClientSideErrors.unregisterFieldError(field.name);
    }
}

ClientSideErrors.registerFieldError = function(fieldName)
{
    fieldErrors[fieldName] = true;
}

ClientSideErrors.unregisterFieldError = function(fieldName)
{
    if(fieldErrors[fieldName])
        delete fieldErrors[fieldName];
}

ClientSideErrors.showClientSideErrorMessage = function()
{
    ClientSideErrors.hideClientSideErrorMessage();
    window.setTimeout(ClientSideErrors.displayClientSideErrorMessage, 200);
    window.scrollTo(0, 0);
}

ClientSideErrors.getElement = function()
{
    return document.getElementById("ClientSideErrorMessage");
}

ClientSideErrors.displayClientSideErrorMessage = function()
{
    if(ClientSideErrors.errorMessageWasShown)
    {
        ClientSideErrors.getElement().style.visibility = "visible";
    }
    else
    {
        ClientSideErrors.getElement().style.display = "block";
        ClientSideErrors.getElement().style.visibility = "visible";
        ClientSideErrors.errorMessageWasShown = true;
    }
    if(ClientSideErrors.onDisplay)
    {
        ClientSideErrors.onDisplay();
    }
}


ClientSideErrors.hideClientSideErrorMessage = function()
{
    if(ClientSideErrors.errorMessageWasShown)
        ClientSideErrors.getElement().style.visibility = "hidden";
    ClientSideErrors.canSetInvalidFieldInFocus = true;
}

ClientSideErrors.hideClientSideErrorMessageIfNoErrors = function()
{
    if(!ClientSideErrors.hasErrors())
        ClientSideErrors.hideClientSideErrorMessage();
}

ClientSideErrors.hasErrors = function()
{
    var count = 0;
    for(var i in fieldErrors)
        count++;
    return count > 0;
}

/*
 * Marks the specified fieldLabelNode as invalid. It means that label will has red bold font (as determined in errorFieldLabel
 * style) and it will has errorTitle title.
 */
ClientSideErrors.markFieldLabelsAsInvalid = function(fieldLabelNode, errorTitle, errorClass, saveOriginalClass)
{
    if (fieldLabelNode != null && typeof (fieldLabelNode) != typeof undefined) {
        if (!saveOriginalClass) {
            fieldLabelNode.className = "errorFieldLabel";
        } else {
            addClass(fieldLabelNode, "errorFieldLabel");
        }
        fieldLabelNode.title = errorTitle;
        if(errorClass)
            addClass( fieldLabelNode, errorClass );
    }
}

/*
 * Marks the specified fieldLabelNode as valid.
 */
ClientSideErrors.markFieldLabelsAsValid = function(fieldLabelNode, errorClass, saveOriginalClass)
{
    if (fieldLabelNode != null && typeof (fieldLabelNode) != typeof undefined) {
        if (!saveOriginalClass) {
            fieldLabelNode.className = "";
        } else {
            removeClass(fieldLabelNode, "errorFieldLabel");
        }
        fieldLabelNode.title = "";
        if(errorClass)
            removeClass( fieldLabelNode, errorClass );
    }
}

ClientSideErrors.setInvalidFieldInFocus = function(field)
{
    if (!ClientSideErrors.isFocusingFirstFieldOnErrorEnabled)
    {
        return;
    }

    if (ClientSideErrors.canSetInvalidFieldInFocus)
    {
        field.focus();
        ClientSideErrors.canSetInvalidFieldInFocus = false;
    }
}
