// Popup positioning strategies

// Base class for all positioning strategies
function PositioningStrategy(){

}

/**
 * Calculates and returns cooridnates
 */
PositioningStrategy.prototype.calculateCoordinates = null;

/*
 With this strategy popup window is displayed relative to position of page element, click on which
 causes popup to be shown. Reference to the element is obtained from "event" object.
 */
RelativePositioning.prototype = new PositioningStrategy();

function RelativePositioning(){

}

/**
 * Calculates and returns cooridnates
 *
 * @return coordinates {x, y}
 */
RelativePositioning.prototype.calculateCoordinates = function(){

    var event = window.event;
    return calculateCoords(event);
}

/**
 * Specific element relative positoning
 */
ElementRelativePositioning.prototype = new PositioningStrategy();

/**
 * @param elementId is the id of an element relative to which positioning should be performed
 */
function ElementRelativePositioning(elementId){

    this.elementId = elementId;
}

/**
 * Returns reference to object relative to which coordinates should be calculated
 *
 * @return reference to object relative to which coordinates should be calculated
 */
ElementRelativePositioning.prototype.getReferenceElement = function(){

    return document.getElementById(this.elementId);
}

/**
 * Calculates and returns coordinates
 *
 * @return coordinates {x, y}
 */
ElementRelativePositioning.prototype.calculateCoordinates = function(){

    return coords = calculateObjectCoords(this.getReferenceElement());
}


/**
 * Specific element relative positoning
 */
ElementRelativeOnTheRightEdgePositioning.prototype = new PositioningStrategy();

/**
 * @param elementId is the id of an element relative to which positioning should be performed
 * @param elementToPosId is the id of an element should be performed
 */
function ElementRelativeOnTheRightEdgePositioning(elementId, elementToPosId){

    this.elementId = elementId;
    this.elementToPosId = elementToPosId;
}

/**
 * Returns reference to object relative to which coordinates should be calculated
 *
 * @return reference to object relative to which coordinates should be calculated
 */
ElementRelativeOnTheRightEdgePositioning.prototype.getReferenceElement = function(){

    return document.getElementById(this.elementId);
}

/**
 * Returns reference to object to be positioned
 *
 * @return reference to object to be positioned
 */
ElementRelativeOnTheRightEdgePositioning.prototype.getElementToPosition = function(){

    return document.getElementById(this.elementToPosId);
}

/**
 * Calculates and returns coordinates
 *
 * @return coordinates {x, y}
 */
ElementRelativeOnTheRightEdgePositioning.prototype.calculateCoordinates = function(){

    var refEl = this.getReferenceElement();
    var posEl = this.getElementToPosition();
    var coords = calculateObjectCoords(refEl);

    coords.x += refEl.offsetWidth - posEl.offsetWidth;

    return coords;
}

/**
 * Specify element relative positioning in container
 */
ElementRelativeInTheContainerPositioning.prototype = new PositioningStrategy();

/**
 *
 * @param relativeElementId id of an element relative to which positioning should be performed
 * @param containerElementId id of container where relative and positioned element placed
 */
function ElementRelativeInTheContainerPositioning(relativeElementId, containerElementId){

    this.relativeElementId = relativeElementId;
    this.containerElementId = containerElementId;
}

/**
 * Returns element relative to which positioning should be performed
 */
ElementRelativeInTheContainerPositioning.prototype.getReferenceElement = function(){

    return document.getElementById(this.relativeElementId);
}

/**
 * Returns container where relative and positioned element placed
 */
ElementRelativeInTheContainerPositioning.prototype.getContainerElement = function(){

    return document.getElementById(this.containerElementId);
}

/**
 * Calculates and returns coordinates
 *
 * @return coordinates {x, y}
 */
ElementRelativeInTheContainerPositioning.prototype.calculateCoordinates = function(){

    var refEl = this.getReferenceElement();
    var containerEl = this.getContainerElement();
    var refCoords = calculateObjectCoords(refEl);
    var containerCoords = calculateObjectCoords(containerEl);

    return {
        x: Math.abs(refCoords.x - containerCoords.x),
        y: Math.abs(refCoords.y - containerCoords.y)
    };
}


/**
 * Base class for all showing strategies.
 * Showing strategies is strategies for showing/hiding popups.
 * 
 * @param element is element to use.
 */
function ShowHideStrategy(elementId)
{
    this.elementId = elementId;
}
/**
 * Shows element with this strategy.
 */
ShowHideStrategy.prototype.show = null;

/**
 * Hides element with this strategy.
 */
ShowHideStrategy.prototype.hide = null;

/**
 * Determinates if element is visible
 */
ShowHideStrategy.prototype.isVisible = null;

ShowHideStrategy.prototype.getElement = function()
{
    return document.getElementById(this.elementId);    
}


// --------showHideByDisplayPropertyStrategy
ShowHideByDisplayPropertyStrategy.prototype = new ShowHideStrategy();
ShowHideByDisplayPropertyStrategy.prototype.parentClass = ShowHideStrategy;

/**
 * Initializes strategy. This strategy shows/hides element using 'display' style element property.
 *
 * @param elementId is the id of an element to work with.
 */
function ShowHideByDisplayPropertyStrategy(elementId)
{
    this.parentClass(elementId);
}

/**
 * Shows element using 'display' property.
 */
ShowHideByDisplayPropertyStrategy.prototype.show = function()
{
    this.getElement().style.display = "block";
}

/**
 * Hides element using 'display' property.
 */
ShowHideByDisplayPropertyStrategy.prototype.hide = function(){

    this.getElement().style.display = "none";
}

/**
 * Determinates if element is visible
 */
ShowHideByDisplayPropertyStrategy.prototype.isVisible = function(){

    return this.getElement().style.display != "none";
}

// --------showHideByDisplayPropertyStrategy
ShowHideByVisibilityPropertyStrategy.prototype = new ShowHideStrategy();
ShowHideByVisibilityPropertyStrategy.prototype.parentClass = ShowHideStrategy;

/**
 * Initializes strategy. This strategy shows/hides element using 'display' style element property.
 *
 * @param elementId is the id of an element to work with.
 */
function ShowHideByVisibilityPropertyStrategy(elementId)
{
    this.parentClass(elementId);
}

/**
 * Shows element using 'display' property.
 */
ShowHideByVisibilityPropertyStrategy.prototype.show = function()
{
    this.getElement().style.visibility = "visible";
}

/**
 * Hides element using 'display' property.
 *
 * @param element is element to hide.
 */
ShowHideByVisibilityPropertyStrategy.prototype.hide = function(){

    this.getElement().style.visibility = "hidden";
}

/**
 * Determinates if element is visible
 */
ShowHideByVisibilityPropertyStrategy.prototype.isVisible = function(){

    return this.getElement().style.visibility != "hidden";
}




/**
 * DHTML popup base class
 */
function DhtmlPopup(divId) {

    this.divId = divId;
    this.iframeId = divId + 'Iframe';

    this.afterHideHandler = null;   // Handler that is executed after popup is hidden
    this.beforeHideHandler = null;  // Handler that is executed before popup is hidden
    this.afterShowHandler = null;   // Handler that is executed after popup is shown
    this.popupPositionNeededHandler = null; //Handler that executed when popup needs repositioning.

    this.owner = null;

    this.showHideStrategy = new ShowHideByDisplayPropertyStrategy(divId);

    // Specify events to be dereferenced
    this.addEventDereferencer("click");
    this.addEventDereferencer("keydown");

    this.applyBeyondScreenDisplayFix = false;
}

DhtmlPopup.prototype.setShowHideStrategyClass = function(Strategy)
{
    this.showHideStrategy = new Strategy(this.divId);
}

/**
 * @return popup DIV element id
 */
DhtmlPopup.prototype.getDivId = function()
{
    return this.divId;
}


DhtmlPopup.prototype.setOwner = function(owner)
{
    this.owner = owner;
}

DhtmlPopup.prototype.getOwner = function()
{
    return this.owner;
}

/**
 * Dereferences "Event" object (browsers other then IE) so it can be referred as "window.event"
 * for event specified by event name parameter
 * @param eventName name of an event
 */
DhtmlPopup.prototype.addEventDereferencer = function(eventName){

    if(document.addEventListener){
        document.addEventListener(eventName, function (e) { window.event = e; }, true);
    }
}

DhtmlPopup.prototype.setAfterShowHandler = function (afterShowHandler) {
    this.afterShowHandler = afterShowHandler;
}

DhtmlPopup.prototype.setBeforeShowHandler = function (beforeShowHandler) {
    this.beforeShowHandler = beforeShowHandler;
}

DhtmlPopup.prototype.setAfterHideHandler = function(afterHideHandler) {
    this.afterHideHandler = afterHideHandler;
}

DhtmlPopup.prototype.setPopupPositionNeededHandler = function(popupPositionNeededHandler)
{
    this.popupPositionNeededHandler = popupPositionNeededHandler;
}

/* beforeHideHandler must return true or false. if true is returned, then popup will be hided, if false - it will not */
DhtmlPopup.prototype.setBeforeHideHandler = function(beforeHideHandler) {
    this.beforeHideHandler = beforeHideHandler;
}

/**
 * Sets the postioning strategy for popup
 * @param posStrategy strategy to set
 */
DhtmlPopup.prototype.setPositioningStrategy = function(posStrategy){

    this.posStrategy = posStrategy;
}

DhtmlPopup.prototype.getPopupDiv = function() {
    return document.getElementById(this.divId);
}

DhtmlPopup.prototype.getPopupIframe = function() {
    return document.getElementById(this.iframeId);
}

/**
 * Calculates and returns coordinates of this popup
 * @return coordinates of this popup
 */
DhtmlPopup.prototype.getPopupCoordinates = function(){

    return this.posStrategy.calculateCoordinates();
}

/**
 * Shows popup at specified offsets from coordinates defined by popup position calculation strategy
 *
 * @param offsetX x coordinate offset
 * @param offsetY y coordinate offset
 * @param width width of the popup in pixels (if null then width won't be set)
 * @param height height of the popup in pixels (if null then height won't be set)
 * @param isOriginAtBottom - if true then popup's origin is considered to be at the bottom side instead of top
 *
 * NOTE: the popup will be shown twice while positioning himself. First time to calculate coordinates,
 *       second time to avoid browser related display issues like Bug 40520.
 *       So if there is some action to be performed after the popup is shown, it should be done using the window.setTimeout.
 */
DhtmlPopup.prototype.show = function (offsetX, offsetY, width, height, isOriginAtBottom) {
    // Register new event handlers for document elements
    this.registerEventHandlers();

    if (this.beforeShowHandler)
        this.beforeShowHandler();

    this.positionPopup(offsetX, offsetY, width, height, isOriginAtBottom);

    this.scrollWindowIfNeeded();
    
    // Execute "After show" handler if there is one
    if (this.afterShowHandler)
        this.afterShowHandler();
}

/**
 * Positions and shows popup if it is hidden.
 * @param offsetX - x offset relative to reference element.
 * @param offsetY - y offset relative to reference element.
 * @param width - popup width, can be null
 * @param height - popup height, can be null
 * @param isOriginAtBottom - orientation
 */
DhtmlPopup.prototype.positionPopup = function(offsetX, offsetY, width, height, isOriginAtBottom)
{
    // Get popup coordinates and apply offsets to them
    var coords = this.getPopupCoordinates();
    if (offsetX != undefined)
        coords.x += offsetX;
    if (offsetY != undefined)
        coords.y += offsetY;

    var popupDiv = this.getPopupDiv();

    var showHideStrategy = this.showHideStrategy;

    // Show popup to calculate its width
    showHideStrategy.show();

    if (width)
        popupDiv.style.width = width + "px";
    if (height)
        popupDiv.style.height = height + "px";


    // Position popup to calculated coordinates
    shiftTo(popupDiv, coords.x, coords.y, isOriginAtBottom);

    // if popup's right edge is beyond the window edge, move it to the left
    // TODO: similar functionality is in dhtml_title.js, make it reusable (kostenko)
    var curWidth = getObjectWidth(popupDiv.id);
    var reserveForScroller = isMSIE() ? 0 : 20;
    var oversize = coords.x + curWidth - document.body.scrollLeft - getInsideWindowWidth() + reserveForScroller;
    if (oversize > 0)
    {
        shiftTo(popupDiv, coords.x - oversize, coords.y, isOriginAtBottom);
    }

    // Fix for a Bug 39607
    this.applyBeyondScreenDisplayFixIfNeeded();

    if (isMSIE()) {
        this.updateIframe();
    }
}

// Following code is a workaround for Bug 40520 'Chrome: Enter TT/ Edit timesheet template: Comments pannel is broken some times'
// The issue reason is that when popup is show in the position where window oversize occurs and it been moved back to avoid
// scrollbar, Сhrome does not draw the popup properly. So we need to re-draw it when popup has been properly located.
DhtmlPopup.prototype.applyBeyondScreenDisplayFixIfNeeded = function() {
    if( this.applyBeyondScreenDisplayFix )
    {
        var showHideStrategy = this.showHideStrategy;
        showHideStrategy.hide();
        window.setTimeout( function( ) {
            showHideStrategy.show();
        }, 0 );
    }
}

DhtmlPopup.prototype.setApplyBeyondScreenDisplayFix = function( needToApply ) {
    this.applyBeyondScreenDisplayFix = needToApply;
}

DhtmlPopup.prototype.scrollWindowIfNeeded = function() {

    scrollWindowIfNeeded(this.getContentElement());
}

DhtmlPopup.prototype.updatePopupPosition = function()
{
    if (!this.isVisible())
        return;

    if (this.popupPositionNeededHandler)
        this.popupPositionNeededHandler(this);
}


DhtmlPopup.prototype.getContentElement = function()
{
    return this.getPopupDiv();
}

DhtmlPopup.prototype.updateIframe = function() {

    var popup = this.getPopupDiv();
    var frame = this.getPopupIframe();

    if (!frame)
    {
        return;
    }
    
    if (popup.offsetWidth) {
        frame.style.width = popup.offsetWidth;
        frame.style.height = popup.offsetHeight;
        frame.style.top = popup.offsetTop;
        frame.style.left = popup.offsetLeft;
        frame.style.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
        frame.style.display = "block";
    }
}

/**
 * Used for get popup visibility.
 *
 * @return true if popup is visible, else false.  
 */
DhtmlPopup.prototype.isVisible = function() {

    return this.showHideStrategy.isVisible();
}

/**
 * Hides popup
 *
 * @return true if popup is successfully hidden, false otherwise
 */
DhtmlPopup.prototype.hide = function () {

    // Simply return if popup is not visible
    if(!this.isVisible()){
        return true;
    }

    // Execute "Before hide" handler if there is one
    if (this.beforeHideHandler && !this.beforeHideHandler())
        return false; // Do not hide if error returned

    // Restore previous event handlers for document elements
    this.restoreEventHandlers();

    // Make popup non-visible
    this.showHideStrategy.hide();

    // If Internet Explorer also hide Iframe
    if (isMSIE()) {
        var frame = this.getPopupIframe();
        if (frame)
            frame.style.display = 'none';
    }

    // Execute "After hide" handler
    if (this.afterHideHandler)
        this.afterHideHandler();

    // Return "true" to indicate success
    return true;
}

/**
 * Registers event handlers
 */
DhtmlPopup.prototype.registerEventHandlers = function(){

    // Do nothing
}

/**
 * Restores event handlers
 */
DhtmlPopup.prototype.restoreEventHandlers = function(){

    // Do nothing
}

/**
 * Returns handler to function that closes this popup
 */
DhtmlPopup.prototype.getClosePopupHandler = function(){

    var popupObj = this;    // Dereference this popup

    // Create and return handler
    var closePopupHandler = function(){
        window.event.returnValue = false;
        return popupObj.hide();
    }

    return closePopupHandler;
}


/**
 * Sets the caller element - for example, the button that causes the popup to be shown.
 * The value set can be then used in event handlers (e.g. afterHideHandler).
 */
DhtmlPopup.prototype.setCallerElement = function(callerElement){

    this.callerElement = callerElement;
}


/**
 * Returns the caller element set by setCallerElement().
 * This can be then used in event handlers (e.g. afterHideHandler). 
 */
DhtmlPopup.prototype.getCallerElement = function(){

    return this.callerElement;
}
