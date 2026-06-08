/**
 * Object for key down handler manipulating.
 */
function KeyDownHandler()
{
}

/**
 * Sets key down handler to the document, saves old handler.
 * @param userFunction
 */
KeyDownHandler.setOnKeyDownHandler = function(userFunction)
{
    if ( !this.oldDocumentKeydownHandler )
        this.oldDocumentKeydownHandler = new Array();
    this.oldDocumentKeydownHandler.push( document.onkeydown );

    document.onkeydown = function(event)
    {
        userFunction(event);
    }
}

/**
 * Restores key down handler saved by KeyDownHandler.setOnKeyDownHandler.
 */
KeyDownHandler.restoreOnKeyDownHandler = function()
{
    var oldHandler;
    if ( this.oldDocumentKeydownHandler && (oldHandler = this.oldDocumentKeydownHandler.pop()) )
        document.onkeydown = oldHandler;
    else
        document.onkeydown = null;  // We assign null to onkeydown if old handler was undefined,
                                    // because assigning undefined value fails under IE. 
}