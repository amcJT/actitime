/*
 * JS is needed for utility functions and contains functions those can be used by any page (BUT IT SHOULD BE INCLUDED ON
 * THE PAGE).
 */

/*
 * Determines whether the specified string are equal or not.
 */
function isEqualsIgnoreCase(str1, str2){
    return str1.toLowerCase() == str2.toLowerCase();
}

/*
 * Determines whether the specified array contains the specified value.
 */
function isArrayContains(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            return true;
        }
    }

    return false;
}

/*
 * Removes the specified element from array and returns new array without it.
 */
function removeElementFromArray(array, removedElement) {
    var resultArray = new Array();

    for (var i = 0; i < array.length; i++) {
        if (array[i] != removedElement) {
            resultArray[resultArray.length] = array[i];
        }
    }

    return resultArray;
}

/*
 * Determine whether the specified element is HTML SELECT element.
 */
function isSelectElement(element) {
    return element.type == "select-one";
}

/*
 * Gets element of the page by its id.
 */
function getElementById(elementId) {
    return document.getElementById(elementId);
}

/*
 * Escapes &amp;, &gt;, &lt; and &quot; symbols to display str on a page.
 * Returns escaped string.
 */
function escapeHtmlSymbols(str) {
    if ( (str != undefined) && (typeof str == "string") )
        return str.replace(/&/g, '&amp;').
                replace(/>/g, '&gt;').
                replace(/</g, '&lt;').
                replace(/"/g, '&quot;');
   else
        return "";
}

/*
 * Opposite to escapeHtmlSymbols
 * Replaces &amp;, &gt;, &lt; and &quot; with corresponding characters.
 * Returns new string.
 */
function unescapeHtmlSymbols(str) {
    if ( (str != undefined) && (typeof str == "string") )
        return str.replace(/&amp;/g, '&').
                replace(/&gt;/g, '>').
                replace(/&lt;/g, '<').
                replace(/&quot;/g, '"');
   else
        return "";
}

/**
 * Adds a new class to element's classname. Duplicated classes are ignored.
 * No error checking is performed for input parameters.
 * @param element HTMLElement
 * @param className String
*/
function addClass(element, className) {
    if (!hasClass(element, className)) {
        if (!element.className) {
            element.className = "";
        }
        element.className = element.className + " " + className;
    }
}

/**
 * Checks is the element has specified CSS class. No error checking is performed for input parameters.
 * @param element HTMLElement
 * @param className String - CSS class name to check
*/
function hasClass(element, className) {
    return element.className &&
           ((' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1);
}

/**
 * Removes the given class from the element.
 * If the element has no class with the given name, then does nothing.
 * @param element HTMLElement
 * @param className String name of the class to remove
 */
function removeClass(element, className)
{
    replaceClass(element, className, null);
}

/**
 * Replaces one class with another for the given element.
 * If oldClass has not been added to the element, this method has no effect.
 * If newClass is null, undefined or of zero length, old class will just be removed.
 * No error checking is performed for input parameters.
 * @param element HTMLElement.
 * @param oldClass String Old CSS class name.
 * @param newClass String New CSS class name.
 */
function replaceClass(element, oldClass, newClass) {
    var newElClassName = (' ' + element.className + ' ');

    if (newClass && (newClass.length > 0)) {
        newElClassName = newElClassName.replace(' ' + oldClass + ' ', ' ' + newClass + ' ');
    } else {
        newElClassName = newElClassName.replace(' ' + oldClass + ' ', ' ');
    }

    if (newElClassName.charAt(0) == ' ') {
        newElClassName = newElClassName.substr(1);
    }
    if ((newElClassName.length > 0)
             && (newElClassName.charAt(newElClassName.length - 1) == ' ')) {
        newElClassName = newElClassName.substr(0, newElClassName.length - 1);
    }

     element.className = newElClassName;
}

/**
 * Checks if the second element is a child of the first one.
 * @param parent HTMLElement.
 * @param child  HTMLElement.
 */
function isChildOf(parent, child) {
    if (child) {
        while (child.parentNode) {
            if ((child = child.parentNode) == parent) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Finds a child element with given ID.
 * @param parent HTMLElement
 * @param childId String child's ID
 * @return HTMLElement or null if nothing found
 */
function findChildById(parent, childId)
{
    if (!parent) return null;

    if (parent.id == childId) return parent;

    if (!parent.hasChildNodes()) return null;

    for (var i = 0; i < parent.childNodes.length; i++)
    {
        var res = findChildById(parent.childNodes[i], childId);
        if (res != null) return res;
    }

    return null;
}

/**
 * Checks if mouse pointer has really left the element.
 * (Because of event bubbling, mouse out events are also generated when mouse cursor leaves
 * a child of the element to which handlers are added)
 * @param element HTMLElement to check.
 * @param mouseOutEvent Event object passed to onmouseout event handler.
 */
function isMouseOutElement(element, mouseOutEvent) {
    //IE does not use event.relatedTarget field, but has its own event.toElement
    var targetEl = mouseOutEvent.relatedTarget || mouseOutEvent.toElement;

    var isChild;
    try {
        isChild = isChildOf(element, targetEl);
    } catch (e) {
        //sometimes FF throws 'permission denied' exception when mouse over or out text input
        //see https://bugzilla.mozilla.org/show_bug.cgi?id=214340
        isChild = false;
    }

    return (!isChild && (element != targetEl));
}

/**
 * Checks if mouse pointer is over the specified element.
 * @param element HTMLElement to check.
 * @param mouseOverEvent  Event object passed to onmouseover event handler.
 */
function isMouseOverElement(element, mouseOverEvent) {
    var targetEl = mouseOverEvent.target || mouseOverEvent.srcElement;

    var isChild;
    try {
        isChild = isChildOf(element, targetEl);
    } catch (e) {
        //sometimes FF throws 'permission denied' exception when mouse over or out text input
        //see https://bugzilla.mozilla.org/show_bug.cgi?id=214340
        isChild = false;
    }

    return (isChild || (element == targetEl));
}

/**
 * Creates a handler that will call given function on given scope
 * @param f function
 * @param scope scope object
 */
function makeHandler( f, scope )
{
    return function( event )
    {
        return f.call(scope, event);
    }
}

/**
 * Creates a handler that will call given function on given scope and stops window event propagation
 * @param f function
 * @param scope scope object
 */
function makeHandlerNoPropagation ( f, scope )
{
    return function( event )
    {
        stopEventPropagation( window.event );
        return f.call(scope, event);
    }
}


function getEventTarget( e )
{
    var event;
    if (e)
        event = e;
    else
        event = window.event;

    var target;

    if (event.target) target = event.target; // all browser except for IE
    else if (event.srcElement) target = event.srcElement; // IE only

    if (!target) return null;

    // workaround for Safari - if target element contains text,
    // then this text node will be the target, not the element itself
    if (target.nodeType == 3)
        target = target.parentNode;

    return target;
}

function isTarget( element, event )
{
    var target = getEventTarget( event );
    return (target == element) || ( isChildOf(element, target) );
}

/**
 * Checks if two arrays are equal by converting them to string and comparing the result
 * @param a First array
 * @param b Second array
 */
function compareArrays( a, b )
{
    return ( (!a && !b) || ( a && b && (a.toString() == b.toString()) ));
}

function selectFromArray( ids, array )
{
    var res = [];

    for( var i = 0; i < ids.length; i++ )
        for( var j = 0; j < array.length; j++ )
            if( array[j].id == ids[i] ) {
                res.push( array[j] );
                break;
            }
    return res;
}

function addAll(array, arrayToAdd)
{
    for (var i = 0; i < arrayToAdd.length; i++ )
        array.push(arrayToAdd[i]);
}

function contains( array, element )
{
    for( var i = 0; i < array.length; i++ )
    {
        if( array[i] == element ) return true;
    }
    return false;
}

/**
 * Returns style property value of HTML element with id specified by <code>elementId</code
 *
 * @param elementId HTML element id to get style property value for
 * @param styleProperty style property name
 */
function getStyleById( elementId, styleProperty)
{
    var propertyValue = null;
    var element = document.getElementById(elementId);
	if (element.currentStyle)
		propertyValue = element.currentStyle[styleProperty];
	else if (window.getComputedStyle)
		propertyValue = document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProperty);
	return propertyValue;
}

function getStyleByElement( element, styleProperty)
{
	var propertyValue = null;
    if (element.currentStyle)
		propertyValue = element.currentStyle[styleProperty];
	else if (window.getComputedStyle)
		propertyValue = document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProperty);
	return propertyValue;
}

/**
 * Returns <code>maxLength</code> first symbols of <code>string</code>. If length of <code>string</code> is less then
 *  <code>maxLength</code>, whole <code>string</code> will be returned.
 *
 * @param string the string to truncate
 * @param maxLength maximum length of returning string
 * @param ignoreSuffixLength specifies whether suffix should be assumed as a part of returning string. If false, then
 *        returning string will contains n = (maxLength - passedSuffix.length) first symbols of <code>string</code>
 *        and suffix. If true, then n = maxLength.
 *        [Optional] default : true
 * @param passedSuffix the string to be appended to returning string if string's length greater then maxLength.
 *        [Optional] default : "..."
 */
function truncateStringByLength (string, maxLength, ignoreSuffixLength, passedSuffix )
{
    var suffix = passedSuffix ? passedSuffix : "...";
    var resultLength = ignoreSuffixLength ? maxLength : maxLength - suffix.length;

    if (string.length > maxLength)
        return string.substring(0, resultLength) + suffix;
    else
        return string;
}

/**
 * Returns a concatenation of two passed strings. If any string is NULL, the other one will be return. Returns NULL if
 * both strings are NULL
 * @param stringA
 * @param stringB
 * @param delimiter
 */
function concatStr ( stringA, stringB, delimiter )
{
    var del = delimiter ? delimiter : "";
    if ( stringB )
        stringA = stringA ? stringA + del + stringB : stringB;
    return stringA;
}

/**
 * Determines whether given argument is number or not. It is an inversion of <code>isNaN</code> function.
 * Returns true if <code>arg</code> is number, false if not.
 * @param arg
 */
function isNumber ( arg )
{
    return !isNaN(arg);
}

/**
 * Determines whether given argument is positive number or not.
 * Returns true if <code>arg</code> is positive number, false if not.
 * @param arg
 */
function isPositiveNumber ( arg )
{
    return isNumber( arg ) &&
           (parseFloat( arg ) > 0);
}

/**
 * Determines whether given argument is non-negative number ( >= 0 ).
 * Returns true if <code>arg</code> >= 0, false if not.
 * @param arg
 */
function isNonNegativeInteger ( arg )
{
    return isNumber( arg ) &&
           (parseFloat( arg ) >= 0) &&
           ( parseInt( arg ) == parseFloat( arg ) );
}

/**
 * Determines whether given argument is positive integer number or not.
 * Returns true if <code>arg</code> is positive integer number, false if not.
 * @param arg
 */
function isUnsignedPositiveInteger ( arg )
{
    return isPositiveNumber( arg ) &&
           ( parseInt( arg ) == parseFloat( arg ) ) && /^\d+$/.test(arg);
}

/**
 * Determines whether given argument is an integer number or not.
 * Returns true if <code>arg</code> is an integer number, false if not.
 * @param arg
 */
function isInteger ( arg )
{
    return isNumber( arg ) &&
           ( parseInt( arg ) == parseFloat( arg ) );
}

/**
 * Compares two given objects.
 * Returns true if objects are equal, false if not.
 * @param objectA
 * @param objectB
 */
function equalObjects ( objectA, objectB )
{
    try
    {
        for(p in objectA)
        {
            switch(typeof(objectA[p]))
            {
                case 'object':
                        if ( !equalObjects(objectA[p], objectB[p]) ) { return false }; break;
                case 'function':
                        if (typeof(objectB[p])=='undefined' || (p != 'equals' && objectA[p].toString() != objectB[p].toString())) { return false; }; break;
                default:
                        if (objectA[p] != objectB[p]) { return false; }
            }
        }

        for(p in objectB)
        {
            if(typeof(objectA[p])=='undefined') {return false;}
        }
        return true;
    }
    catch (Exception)
    {
        return false;
    }
}

/**
 * Returns array contains of <code>property</code> values of objects withing <code>array</code>
 * @return
 * @param array Array objects to get <code>property</code> values from
 * @param property String property name
 */
function getPropertyValues( array, property )
{
    var result = new Array();
    if( !array || !property )
        return result;
    for( var i = 0; i < array.length; i++ )
    {
        result.push( array[i][property] );
    }
    return result;
}

/**
 * Safely retrieves value of property of a given HTML element.
 * @param element HTML form element to get value from
 * @param property String property name
 *
 * @return {String} value of a property with name <code>property</code> of HTML element <code>element</code>.
 *                  NULL if there was an exception on attempt to retrieve the value.
 *
 */
function getPropertyValue( element, property )
{
    try{
        return element[property];
    }
    catch( e ){
        return null;
    }
}

/**
 * Generates mouse event of <code>eventType</code> type using parameter of <code>evt</code> event.
 * A target of new event is a target of <code>evt</code>
 * @param evt event to get parameters from
 * @param eventType new event type
 * @param stopPropagation specifies whether event propagation should be stopped
 */
function fireMouseEvent ( evt, eventType, stopPropagation )
{
    var event = evt ? evt : window.event;
    var targetHref = getEventTargetHref( event );
    var mouseEvent;
    if (event.initMouseEvent) // all browsers except IE before version 9
    {
        mouseEvent = document.createEvent ("MouseEvent");
        mouseEvent.initMouseEvent (eventType, true, true, window, 1,
                                    event.screenX, event.screenY, event.clientX, event.clientY,
                                    event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
                                    0, null);
        if (stopPropagation)
            stopEventPropagation( mouseEvent );
        event.target.dispatchEvent (mouseEvent);
    }
    else if (document.createEventObject) // IE before version 9
    {
        mouseEvent = document.createEventObject ( event );
        var target = event.srcElement;
        if (stopPropagation)
            stopEventPropagation( mouseEvent );
        target.fireEvent ( "on" + eventType,  mouseEvent);
    }
    if( targetHref )
        document.location.href = targetHref;
}


/**
 * Returns href attribute of the link on which <code>event</code> occurred. If link does not cause location change,
 * for instance anchor, then <code>NULL</code> is returned.
 * @return String href value of <code>NULL</code> if event has not occurred on the link
 * @param event
 */
function getEventTargetHref( event )
{
    var target = event.target || event.srcElement;
    var targetHref;
    do {
        if ( target.nodeName.toLowerCase() == "a" )
        {
            if(!target.href || target.href == window.location.href || target.href == (window.location.href + '#') ||
                target.href.substr(0, 11).toLowerCase() == "javascript:" ||  target.target || target.onclick)
            {
                continue;
            }
            targetHref = target.href;
            break;
        }
    } while ( target = target.parentNode )

    return targetHref;
}


function hasParentWithClassName ( element, className )
{
    var child = element;
    do {
        if(hasClass(child,  className ))
            return true;
    }
    while (child = child.parentNode);
    return false;
}

/**
 * Stops execution for <code>waitTime</code> milliseconds
 * @param waitTime amount of milliseconds to stop execution. Equals 250 by default.
 */
function wait ( waitTime )
{
    var time = waitTime ? waitTime : 250;
    var now = new Date().getTime();
    while( now + time > (new Date().getTime()) ){}
}

/**
 * Determines whether we are running under Chrome.
 * @returns true if current browser is Chrome, false if not.
 */
function isChrome()
{
    return /chrome/.test( navigator.userAgent.toLowerCase() );
}

/**
 * Determines whether we are running under FireFox.
 * @returns true if current browser is FireFox, false if not.
 */
function isFireFox()
{
    return /firefox/.test( navigator.userAgent.toLowerCase() );
}

/**
 * Determines whether we are running under InternetExplorer.
 * @returns true if current browser is InternetExplorer, false if not.
 */
function isInternetExplorer()
{
    return /msie/.test( navigator.userAgent.toLowerCase() );
}

/**
 * Provides save form submit functionality. The function catches an exception is thrown by IE if submit has been canceled by user
 *
 * @param form to perform submit for
 */
function doSafeSubmit( form )
{
    try{
        form.submit();
    }
    catch( e )
    {
        /*
         * Here we catch an exception which occurs in IE when form submission has been canceled by user within
         * window.onbeforeunload event handler
         */
    }
}

/**
 * Provides save location change functionality. The function catches an exception is thrown by IE if location change
 * has been canceled by user
 *
 * @param href to change location to
 */
function doSafeLocationChange( href )
{
    try{
        window.location.href = href;
    }
    catch( e )
    {
        /* Here we catch an exception which occurs in IE when attempt to leave page has been canceled by user within
         * window.onbeforeunload event handler */
    }
}

/**
 * Cancel event bubbling in all browsers
 * @param event action event
 */
function cancelBubble(event) {
    event = event || window.event;
    event.cancelBubble = true;
}

/**
 * Returns dom element id based on prefix and id, which is unique among elements of type specified by prefix
 * @param prefix identifier of elements group
 * @param id is unique among elements of type specified by prefix
 */
function formatId(prefix, id) {
    return prefix + "_" + id;
}

/**
 * Returns true if object has no properties and false otherwise
 * @param obj checking object
 */
function isObjectEmpty(obj) {
    for (var prop in obj) {
        return false;
    }
    return true;
}

/**
 * Save array of items in cookie in csv format.
 * If length of csv is larger than max cookie size then first items of array will be exclude from cookie
 * If cookies is disabled do nothing
 * @param arr array
 * @param cookieName name of key in cookie
 */
function saveArrayIntoCookies(arr, cookieName) {
    var COUNT_OF_DELETED_ITEMS = 10;

    var arrayStr = arr.join(",");
    setCookie( cookieName, arrayStr );

    // max length of cookie is about 4000 symbols only,
    // therefore should delete old ids to release place for new ids
    var savedValue = getCookie( cookieName );
    if( savedValue && savedValue != arrayStr )
    {
        arr.splice( 0, COUNT_OF_DELETED_ITEMS );
        saveArrayIntoCookies(arr, cookieName);
    }
}

/**
 * Return array of items from cookie(if in cookie it is stored in csv).
 * If cookies is disabled, returns empty array
 * @param cookieName name of key in cookie
 */
function getArrayFromCookies(cookieName) {
    var arrayStr = getCookie( cookieName );

    if( arrayStr == null )
        return new Array();
    else
        return arrayStr.split(",");
}

/**
 * Defines fact that letter or digit symbol is pressed by key code. If event has no key code return s false
 * @param event event
 */
function isLetterOrDigitSymbolPressed(event) {
    event = event || window.event;
    var keyCode = event.keyCode;
    if (!keyCode) {
        return false;
    }
    return (keyCode > 32) && (keyCode < 91);
}

/**
 * Compare two strings in case-insensitive alphabetic order
 * @param a first string
 * @param b second string
 */
function stringComparator(a, b) {
    return a.toLocaleLowerCase().localeCompare( b.toLocaleLowerCase() );
}

