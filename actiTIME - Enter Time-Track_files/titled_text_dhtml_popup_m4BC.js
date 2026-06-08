TitledTextDhtmlPopup.prototype = new DhtmlPopup();
TitledTextDhtmlPopup.prototype.titledTextParentClass = DhtmlPopup;

/**
 * DHTML popup with text and title
 */
function TitledTextDhtmlPopup(divId){

    this.titledTextParentClass(divId);    // Call parent class constructor

    this.titleId = divId + 'Title';   // Id of title element
    this.textId = divId + 'Text';     // Id of text element

    // By default relative positioning is used for this type of popups
    this.setPositioningStrategy(new RelativePositioning());
}

TitledTextDhtmlPopup.prototype.getPopupTitleObject = function() {

    return document.getElementById(this.titleId);
}

TitledTextDhtmlPopup.prototype.getPopupTextObject = function() {

    return document.getElementById(this.textId);
}

/**
 * @return returns value of text element
 */
TitledTextDhtmlPopup.prototype.getPopupTextValue = function() {

    return "";
}

/**
 * @return true if text element is empty, false otherwise
 */
TitledTextDhtmlPopup.prototype.isEmpty = function() {

    return trim(this.getPopupTextValue()).length == 0;
}

/**
 * Restores registered event handlers
 */
TitledTextDhtmlPopup.prototype.restoreEventHandlers = function(){

    KeyDownHandler.restoreOnKeyDownHandler();          // restoring keydown
}

/**
 * Registeres event handlers
 */
TitledTextDhtmlPopup.prototype.registerEventHandlers = function(){

    var closePopupHandler = this.getClosePopupHandler();

    KeyDownHandler.setOnKeyDownHandler(function(event) {

        // Popup is closed when 'Esc' button is pressed
        handleEscape(closePopupHandler, event);
    }
            );
}

/**
 * Sets popup title
 * @param title value to set
 */
TitledTextDhtmlPopup.prototype.setPopupTitle = function(title){

    this.getPopupTitleObject().firstChild.nodeValue = title;
}

/**
 * Sets value of text
 * @param text value to set
 */
TitledTextDhtmlPopup.prototype.setPopupText = function(text){
}

/**
 * Shows popup at specified offsets from coordinates, defined by popup position calculation strategy,
 * with sepcified text and title
 *
 * @param title popup title
 * @param text popup text
 * @param offsetX x coordinate offset
 * @param offsetY y coordinate offset
 */
TitledTextDhtmlPopup.prototype.show = function(title, text, offsetX, offsetY){

    this.setPopupTitle(title);  // Set popup title
    this.setPopupText(text);    // Set popup text

    // Call parent class "show" method
    this.titledTextParentClass.prototype.show.call(this, offsetX, offsetY);
}

/**
 * Updates popup with specified title and text
 *
 * @param title popup title
 * @param text popup text
 */
TitledTextDhtmlPopup.prototype.update = function(title, text) {

    this.setPopupTitle(title);  // Set new title
    this.setPopupText(text);    // Set new text

    this.scrollWindowIfNeeded();
    if (isMSIE()) {
        this.updateIframe();
    }
}


/**
 * Titled DHTML popup with editable text
 *
 */
EditableTextDhtmlPopup.prototype = new TitledTextDhtmlPopup();
EditableTextDhtmlPopup.prototype.editableTextParentClass = TitledTextDhtmlPopup;

function EditableTextDhtmlPopup(divId){
                                //alert(this.constructor);
    this.editableTextParentClass(divId);    // Call parent class constructor

}

/**
 * Shows popup at specified offsets from coordinates, defined by popup position calculation strategy,
 * with sepcified text and title
 *
 * @param title popup title
 * @param text popup text
 * @param offsetX x coordinate offset
 * @param offsetY y coordinate offset
 */
EditableTextDhtmlPopup.prototype.show = function(title, text, offsetX, offsetY){

    // Call parent class "show" method
    this.editableTextParentClass.prototype.show.call(this, title, text, offsetX, offsetY);

    var panel = this;
    // Focus on text element
    window.setTimeout( function( ) {
        panel.focusOnText();
    }, 10 );
}

/**
 * Sets focus on text element
 */
EditableTextDhtmlPopup.prototype.focusOnText = function(){

    try {
        // Try to focuse, some browsers may not support
        this.getPopupTextObject().focus();
    }
    catch (e) {
        // Do nothing
    };
}

/**
 * Sets value of text
 * @param text value to set
 */
EditableTextDhtmlPopup.prototype.setPopupText = function(text){

    // Set value and focus on text element
    this.getPopupTextObject().value = text;
    this.focusOnText();
}

/**
 * @return returns value of text element
 */
EditableTextDhtmlPopup.prototype.getPopupTextValue = function() {

    return this.getPopupTextObject().value;
}


/**
 * Titled DHTML popup with static text
 *
 */
StaticTextDhtmlPopup.prototype = new TitledTextDhtmlPopup();
StaticTextDhtmlPopup.prototype.staticTextParentClass = TitledTextDhtmlPopup;

function StaticTextDhtmlPopup(divId){

    this.staticTextParentClass(divId);    // Call parent class constructor
}

/**
 * Sets value of text
 * @param text value to set
 */
StaticTextDhtmlPopup.prototype.setPopupText = function(text){

    this.getPopupTextObject().innerHTML = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
}

/**
 * Sets popup title
 * @param title value to set
 */
StaticTextDhtmlPopup.prototype.setPopupTitle = function(title){

    // Call parent class method
    this.staticTextParentClass.prototype.setPopupTitle.call(this, title);

    // to fix problem in Mozilla when text length exceeds default popup width
    if (!isMSIE()) {
        var popupTitle = this.getPopupTitleObject();
        popupTitle.parentNode.style.width = popupTitle.offsetWidth;
    }
}

/**
 * @return returns value of text element
 */
StaticTextDhtmlPopup.prototype.getPopupTextValue = function() {

    return this.getPopupTextObject().firstChild.nodeValue;
}