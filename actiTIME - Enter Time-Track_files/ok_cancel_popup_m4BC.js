/**
 * Popup extended with ok/cancel buttons functionality and errors displaying.
 *
 * Requires included before:
 *   - at_js.jsp;
 *   - client_side_errors.js;
 *
 * Structure of popup markup:
 *
 *  <div id="outerElementId">
 *    ...
 *      <div id="innerElementId">
 *         text will be here
 *      </div>
 *    ...
 *       <input type="button" value="ok button caption" onclick="globalVarPopup.okClickHandler(this)" >
 *       <input type="button" value="cancel button caption" onclick="globalVarPopup.cancelClickHandler(this)">
 *    ...
 *  </div>
 *
 * OuterElement is any block level element. Must have 'id' attribute.
 * InnerElement is block element, that can contain text as innerHTML.
 *
 */

OkCancelPopup.prototype = new DhtmlPopup();
OkCancelPopup.prototype.parentClass = DhtmlPopup;

/**
 * Initializes OkCancelPopup instance.
 *
 * @param popupDivId is id of the popup block element.
 * @param errorDiv is html block element, that contains message markup, not null.
 * @param errorTextDiv is html block element, that will contain text of a message, not null.
 */
function OkCancelPopup(popupDivId, popupTableId, errorDiv, errorTextDiv)
{
    this.errorDiv = errorDiv;
    this.errorTextDiv = errorTextDiv;

    this.onOkClickHandler = null;
    this.onCancelClickHandler = null;

    this.popupDivId = popupDivId;
    this.popupTableId = popupTableId;

    this.parentClass(popupDivId);
}

/**
 * Shows the error message, or blinks it, if it is already shown.
 * @param message - message text
 */
OkCancelPopup.prototype.showErrorMessage = function(message)
{
    this.errorTextDiv.innerHTML = message;
    showElement(this.errorDiv);
    this.errorDiv.style.visibility = "hidden";
    window.setTimeout("document.getElementById('"+this.errorDiv.id+"').style.visibility = 'visible'", 200);
};

/**
 * Hides the error message.
 */
OkCancelPopup.prototype.hideErrorMessage = function()
{
    hideElement(this.errorDiv);
    this.errorTextDiv.innerHTML = "";
};


/**
 * Click 'OK' button
 * <i> note: this function can be called only from code. For user events
 * use okClickHandler instead</i>
 */
OkCancelPopup.prototype.clickOk = function()
{
    this.okClickHandler(null)       
}

/**
 * Click 'Cancel' button
 * <i> note: this function can be called only from code. For user events
 * use okClickHandler instead</i>
 */
OkCancelPopup.prototype.clickCancel = function()
{
    this.cancelClickHandler(null)
}

/**
 * This event must be called on OK button click
 *
 * @param element is html button element, that caused click OR null if it caused by code.
 */
OkCancelPopup.prototype.okClickHandler = function(element)
{
    if (this.onOkClickHandler != null)
    {
        if (!this.onOkClickHandler(element))
            return;
    }

    this.hide();
}

/**
 * This event must be called on Cancel button click
 * <not>This handler is internal, must _not_ be called directly from code </not>
 *
 * @param element is html button element, that caused click.
 */
OkCancelPopup.prototype.cancelClickHandler = function(element)
{
    if (this.onCancelClickHandler != null)
    {
        if (!this.onCancelClickHandler(element))
          return;
    }

    this.hide();
}

/**
 * Sets handler executed if OK button clicked.
 *
 * @param handler is function(event) that returns true if popup can be closed or false if it can not.
 *   
 */
OkCancelPopup.prototype.setOnOkClickHandler = function(handler)
{
    this.onOkClickHandler = handler;
}

/**
 * Sets handler, that executed if Cancel button clicked.
 *
 * @param handler is function(event) that returns true if popup can be closed or false if it can not.
 *
 */
OkCancelPopup.prototype.setOnCancelClickHandler = function(handler)
{
    this.onCancelClickHandler = handler;
}

/**
 * Shows popup, sets event handlers
 */
OkCancelPopup.prototype.show = function(offsetX, offsetY, width, height, isOriginAtBottom)
{
    var thar=this;

    this.parentClass.prototype.show.call(this, offsetX, offsetY, width, height, isOriginAtBottom);

    KeyDownHandler.setOnKeyDownHandler(function(event)
    {
        handleEscape(function() { thar.clickCancel(); }, event);
    }
            );    
}


/**
 * Hides popup and error message, sets event handlers
 */
OkCancelPopup.prototype.hide = function()
{
    KeyDownHandler.restoreOnKeyDownHandler();

    this.hideErrorMessage();

    this.parentClass.prototype.hide.call(this);
}

