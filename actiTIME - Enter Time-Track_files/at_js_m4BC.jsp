

var canwork = 1;
var opened_popups = new Array();

/**
 * This function is wrapper for window.popup. Use it to check if popups are blocked in a browser
 * and show warning message. After popup window is focused.
 *
 * Parameters are equal original window.popup function.
 *
 */
function windowOpen(URL, name, specs, replace)
{
    var popupWindow = window.open(URL, name, specs, replace);

    if (popupWindow == null)
        alert("Please disable pop-up blocker for actiTIME.")
    else
        popupWindow.focus();
}

function popup(url, name, width, height, menubar, toolbar, returnWindow, toAddToOpenedPopups)
{
    if (canwork)
    {
        canwork = 0;

        if (!name)      name    ="windowedPopup";
        if (!height)    height  = 500;
        if (!width)     width   = 830;
        if (!menubar)   menubar = "no";
        if (!toolbar)   toolbar = "no";

        if (name != 'windowedPopup')
        {
            eval('if (window.' + name + ' && !window.' + name + '.closed) ' + name + '.close();');
        }

        var w = null;
        try {
            w = window.open(url, name,
                            "directories=no,height=" + height +
                            ",width=" + width +
                            ",location=no,menubar=" +  menubar +
                            ",resizable=yes,scrollbars=yes,status=no,toolbar=" + toolbar);

            if (w == null)
            {
                alert("Please disable pop-up blocker for actiTIME.");
                return;
            }


            w.focus();

            if (typeof toAddToOpenedPopups == typeof undefined || // if parameter is not specified
                toAddToOpenedPopups) { // or specified and has value 'true'
                addPopup(w);
            }
        } catch (e) {
            // Can be thrown when user works offline.
        }

        canwork = 1;

        if (returnWindow && w != null) return w;
    }
}

/*
 * Ads the specified pop-up window to opened pop-up windows collection to close them by closeAllOpenedPopups() function
 * on document unloading.
 *
 * @param popupWindow - the pop-up to add.
 */
function addPopup(popupWindow) {
    opened_popups[opened_popups.length] = popupWindow;
}

/*
 * Closes all opened pop-up windows added to opened_popups collection by addPopup(popupWindow) function. This function
 * should be called by onload handler of the document body.
 */
function closeAllOpenedPopups() {
    for (var i = 0; i < opened_popups.length; i++) {
        var popupWindow = opened_popups[i];
        if (!popupWindow.closed) {
            popupWindow.close();
        }
    }
}

function show_in_main_window( messageKey )
{
    if (window.opener && window.name.indexOf('windowedPopup') >= 0)
    {
        var location = window.location.href;
        if (messageKey != null)
            location = addRequestParams(window.location.href, "e=".concat( messageKey ));
        window.opener.location.href = location;
        window.opener.focus();
        window.close();
    }
}

/*
 * Adds the specified params (string like 'param1=value1&param2=value2... etc.') to the specified URL.
 */
function addRequestParams(url, paramsStr) {
    var result = url;

    if (url.indexOf("?") >= 0) {
        result = result.concat("&");
    } else {
        result = result.concat("?");
    }

    return result.concat(paramsStr);
}

function notEmpty(obj, msg)
{
    if ( trim(obj.value).length > 0 )
    {
        if ( msg && msg != '')
        {
            alert(msg)
            obj.focus();
        }
        return false;
    }
    return true;
}

// Select/unselect checkboxes list
// form - form object
// name - checkboxes name
// state - true/false
function setCheckboxesState(form, name, state)
{
    for (var i = 0; i < form.length; i++) {
        if (form.elements[i].type == "checkbox" &&
            form.elements[i].name.search(name) != -1) {
            form.elements[i].checked = state;
        }
    }
}

// Select/unselect options in multiple select
// s - select object
// state - true/false
function setOptionsState(s, state)
{
    for (var i = 0; i < s.options.length; i++) {
        s.options[i].selected = state;
    }
}

// Get selected value from a selector object
function getVal(el)
{
    if (el.type == "select-one")
        if(el.selectedIndex != undefined)
            return parseInt(el.options[el.selectedIndex].value, 10);
        else
            // Opera 6.x
            return parseInt(el.options[el.value].value, 10);
    else
        return parseInt(el.value, 10);
}

function isEmailValid(email){

    // Split email into domain and local parts
    var index = email.indexOf('@');
    var localPart = email.substring(0, index);
    var domain = email.substr(index + 1);

    // Pattern to match
    var pattern = /^\w+([\.-]?\w+)*$/;
    var lastDotPos = domain.lastIndexOf('.'); // Find position of last dot in domain part

    // Check if local part matches pattern, if there is a dot and number of characters after last dot
    // is between 2 and 4 and finally check whether domain part matches pattern
    return pattern.test(localPart) &&
           (lastDotPos >= 1) && (domain.length - lastDotPos <= 5) && (domain.length - lastDotPos >= 3) &&
           pattern.test(domain);
}

function isNotEmpty(str)
{
    return trim(str).length > 0;
}

// checks form field and shows alert in case of error
// validationFunc - pointer to a string that gives one
// string parameter and returns true in case of valid
// value else false
function checkField(field, msg, validationFunc)
{
    eval("var isValid = " + validationFunc + "(field.value)");

    if (isValid)
        return true;

    alert(msg);
    field.focus();
    return false;
}

// Function trims specified value
function trim(str)
{
    str = String(str);

    if (str == "") return str;
    
    var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
    for (var i = 0; i < str.length; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }
    for (i = str.length - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

// Function normalizes specified string
function normalize(str)
{
    var re = /\s{2,}/;

    while (re.test(str))
    {
        str = str.replace(re, " ");
    }

    return str;
}

// Function trims all text form fields
function trimAllTextFields(f)
{
    for (var i = 0; i < f.length; i++) {
        if (f.elements[i].type == 'text') {
            f.elements[i].value = trim(f.elements[i].value);
        }
    }
}

// Function normalizes all text form fields
function normalizeAllTextFields(f)
{
    for (var i = 0; i < f.length; i++) {
        if (f.elements[i].type == 'text') {
            f.elements[i].value = normalize(f.elements[i].value);
        }
    }
}

// Function normalizes specified string
function toUnixLineFeeds(str)
{
    return str.replace(/\r/g, '');
}

function shiftTo(obj, x, y, isOriginAtBottom) {
    var units = (typeof obj.style.left == "string") ? "px" : 0;

    obj.style.left = x + units;

    if (isOriginAtBottom)
    {
        obj.style.top = y - getObjectHeight(obj.id) + units;
    }
    else
        obj.style.top = y + units;
}

function isMSIE() {
    return ((navigator.appVersion.indexOf("MSIE") != -1) && !window.opera);
}

function isMSIE6() {
    return (/MSIE\s6/.test(navigator.userAgent) && !window.opera);
}

function calculateCoords(event) {
    var targetEl = event.srcElement;
    if (!targetEl)
        targetEl = event.target;
    return calculateObjectCoords(targetEl);
}

function calculateObjectCoords(obj) {
    return {x:findPosX(obj), y:findPosY(obj)};
}

function findPosX(obj)
{
    var curleft = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curleft += obj.offsetLeft
            obj = obj.offsetParent;
        }
    }
    else if (obj.x)
        curleft += obj.x;
    return curleft;
}

function findPosY(obj)
{
    var curtop = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curtop += obj.offsetTop
            obj = obj.offsetParent;
        }
    }
    else if (obj.y)
        curtop += obj.y;
    return curtop;
}

function getViewport()
{
    return {
        leftUpperCorner : { x:document.body.scrollLeft, y:document.body.scrollTop },
        rightBottomCorner : { x:document.body.scrollLeft + document.body.clientWidth, y:document.body.scrollTop + document.body.clientHeight }
    }
}

function scrollToElementIfNeeded ( element )
{
    var leftUpperCorner = { x:findPosX(element), y:findPosY(element) };
    var rightBottomCorner = { x:findPosX(element) + element.clientWidth, y:findPosY(element) + element.clientHeight };
    var viewport = getViewport();
    var viewportLeftUpperCorner = viewport.leftUpperCorner;
    var viewportRightBottomCorner = viewport.rightBottomCorner;

    var spacing = document.body.clientHeight/3; //to create a space between element and window border
    var scrollY = 0;
    if ( rightBottomCorner.y > viewportRightBottomCorner.y )
        scrollY = rightBottomCorner.y + spacing - ( viewportRightBottomCorner.y );
    else if ( leftUpperCorner.y < viewportLeftUpperCorner.y )
        scrollY = leftUpperCorner.y - (viewportLeftUpperCorner.y + spacing);
    if ( scrollY != 0 )
        window.scrollBy( 0, scrollY );
}

function scrollWindowIfNeeded(object, alignRight) {
    var leftUpperCorner = { x:object.offsetLeft, y:object.offsetTop };
    var rightBottomCorner = { x:object.offsetLeft + object.clientWidth, y:object.offsetTop + object.clientHeight };
    var viewport = getViewport();
    var viewportLeftUpperCorner = viewport.leftUpperCorner;
    var viewportRightBottomCorner = viewport.rightBottomCorner;

    var scrollX = 0;
    if (leftUpperCorner.x < viewportLeftUpperCorner.x) {
        scrollX = leftUpperCorner.x - viewportLeftUpperCorner.x;
    } else if (alignRight && rightBottomCorner.x > viewportRightBottomCorner.x) {
        scrollX = rightBottomCorner.x - viewportRightBottomCorner.x
    }

    var scrollY = 0;
    if (rightBottomCorner.y > viewportRightBottomCorner.y)
        scrollY = rightBottomCorner.y - viewportRightBottomCorner.y;

    if (scrollX != 0 || scrollY != 0) {
        /*alert("VIEWPORT\ntop-left.x = " + viewportLeftUpperCorner.x + ", top-left.y = " + viewportLeftUpperCorner.y +
              "; bottom-right.x = " + viewportRightBottomCorner.x + ", bottom-right.y = " + viewportRightBottomCorner.y + "\n\n" +
              "object\ntop-left.x = " + leftUpperCorner.x + ", top-left.y = " + leftUpperCorner.y +
              "; bottom-right.x = " + rightBottomCorner.x + ", bottom-right.y = " + rightBottomCorner.y + "\n\n" +
              "SCROLL BY\nscrollX = " + scrollX + ", scrollY = " + scrollY);*/
        window.scrollBy(scrollX, scrollY);
    }
}

/*
 * Unifies new line symbol in the specified string. It is needed for unified string length determining in various
 * browsers, because in some browser (e.g. IE) new line symbol is '\r\n', but in others (e.g. Firefox) new line symbol
 * is '\n'. Because of these differences length of a string can vary in various browsers. To avoid differences this
 * function should be called before a string length determining.
 *
 * @param str a string where new line symbol should be unified.
 * @return string with unified new line symbol.
 */
function getStringWithUnifiedNewLineSymbol(str) {
    return str.replace(/(\r?\n)|(\r\n?)/g, '\r\n');
}

function showElement(element) {
    element.style.display = "block";
}

function hideElement(element) {
    element.style.display = "none";
}

function showElementById(id) {
    showElement(document.getElementById(id));
}

function hideElementById(id) {
    hideElement(document.getElementById(id));
}


/*
 * Shows moire. If user's browser is IE, all drop-downs under moire are replaced by input fields with appropriate text
 * (by text areas in case of multiple selects). Also if user's browser is IE, iframe with alpha channel is placed under
 * moire to imitate transparency.
 */
function showMoire(moireDivId, containerDivId, moireIframeId) {
    var moire = document.getElementById(moireDivId);
    if (moire) {
        shiftTo(moire, 0, 0);

        var moireIframe = document.getElementById(moireIframeId);
        var muarImg = moire.getElementsByTagName("img")[0];

        showElement(moire);
        if (isMSIE()) {
            shiftTo(moireIframe, 0, 0);

            moireIframe.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
            showElement(moireIframe);

            hideElement(muarImg);
            moire.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + muarImg.src + "',sizingMethod='scale')";

            moireHelper.hidePageSelects();
        } else {
            showElement(muarImg);
        }

        var windowResizeHandler = function() {
            resizeMoire(moire, containerDivId, moireIframe, muarImg);
            moireHelper.extinguishEnterTTCalendarWeek();
        };
        moireHelper.setWindowResizeHandler(windowResizeHandler);
        windowResizeHandler();
    }
}

function refreshMoireAfterResizing(moireDivId, containerDivId, moireIframeId) {
    var moire = document.getElementById(moireDivId);
    if (moire) {
        var moireIframe = document.getElementById(moireIframeId);
        var muarImg = moire.getElementsByTagName("img")[0];
        resizeMoire(moire, containerDivId, moireIframe, muarImg);
    }
}

/*
 * Resizes the specified moire according to sizes of the container with the specified containerDivId. If user's browser
 * is IE the specified moireIframe is resized too otherwise the specified muarImg is resized according to moire sizes.
 */
function resizeMoire(moire, containerDivId, moireIframe, muarImg) {
    var clientWindowSizes = getClientSize();
    var container = document.getElementById(containerDivId);
    setMoireSize(moire, moireIframe, muarImg,
                 (container) ? getObjectWidth(containerDivId) : clientWindowSizes[0],
                 (container) ? Math.max(getObjectHeight(containerDivId), clientWindowSizes[1]) : clientWindowSizes[1]);

    if (!(moireHelper.isIE || (moireHelper.isOpera && moireHelper.browserVersion <= 8)) && document.body.scrollWidth) {
        setMoireSize(moire, moireIframe, muarImg, document.body.scrollWidth, document.body.scrollHeight);
    }
}

/*
 * Sets the specified widht and height of the specified moire and moireIframe (if user's browser is IE) or muarImg (if
 * user's browser is not IE).
 */
function setMoireSize(moire, moireIframe, muarImg, width, height) {
    moire.style.width = width;
    moire.style.height = height;
    if (isMSIE()) {
        moireIframe.style.width = width;
        moireIframe.style.height = height;
    } else {
        muarImg.style.width = width;
        muarImg.style.height = height;
    }
}

/*
 * Hides moire having the specified moireDivId. If user's browser is IE moireIframeId should be specified too to hide it.
 * Also if user's browser is IE, all drop-downs under moire are shown again and text fields (text areas) are hided.
 */
function hideMoire(moireDivId, moireIframeId) {
    var moire = document.getElementById(moireDivId);
    if (moire) {
        hideElement(moire);
        if (document.all) {
            var moireIframe = document.getElementById(moireIframeId);
            hideElement(moireIframe);
        }
    }

    var muarImg = moire.getElementsByTagName("img")[0];
    if (muarImg)
        hideElement(muarImg);

    if (moireHelper.isIE) {
        moireHelper.showPageSelects();
    }

    moireHelper.restoreWindowResizeHandler();
    moireHelper.extinguishEnterTTCalendarWeek();
}

/*
 * Determines whether keyboard button having the specified keyCode has been pressed or not.
 *
 * @return true if keyboard button having the specified keyCode has been pressed and false otherwise.
 */
function isKeyPressed(keyCode, evt) {
    var eventObj = getEventObj(evt);

    if (eventObj != null && eventObj.keyCode == keyCode) {
        if (document.all && navigator.userAgent.indexOf("Opera") == -1) {
            eventObj.returnValue = false;
        } else {
            eventObj.preventDefault();
        }

        return true;
    }

    return false;
}

/*
 * Determines whether TAB keyboard button has been pressed or not.
 *
 * @return true if TAB has been pressed and false otherwise.
 */
function isTabPressed(evt) {
    return isKeyPressed(9, evt);
}

/*
 * Calls the specified handler if TAB keyboard button has been pressed.
 */
function handleTab(tabHandler, evt) {
    if (isTabPressed(evt)) {
        tabHandler();
    }
}

/*
 * Determines whether ESC keyboard button has been pressed or not.
 *
 * @return true if ESC has been pressed and false otherwise.
 */
function isEscapePressed(evt) {
    return isKeyPressed(27, evt);
}

/*
 * Calls the specified handler if ESC keyboard button has been pressed.
 */
function handleEscape(escHandler, evt) {
    if (isEscapePressed(evt)) {
        escHandler();
    }
}

/*
 * Determines whether ENTER keyboard button has been pressed or not.
 *
 * @return true if ENTER has been pressed and false otherwise.
 */
function isEnterPressed(evt) {
    return isKeyPressed(13, evt);
}

/*
 * Calls the specified handler if ENTER keyboard button has been pressed.
 */
function handleEnter(enterHandler, evt) {
    if (isEnterPressed(evt)) {
        enterHandler();
    }
}

// return client size
function getClientSize() {
    // window scroll factors
    var scrollX = 0, scrollY = 0;
    if (document.body && typeof document.body.scrollTop != undefined) {
        scrollX += document.body.scrollLeft;
        scrollY += document.body.scrollTop;
        if (document.body.parentNode &&
            typeof document.body.parentNode.scrollTop != undefined) {
            scrollX += document.body.parentNode.scrollLeft;
            scrollY += document.body.parentNode.scrollTop;
        }
    } else if (typeof window.pageXOffset != undefined) {
        scrollX += window.pageXOffset;
        scrollY += window.pageYOffset;
    }
    return new Array(getInsideWindowWidth() + scrollX, getInsideWindowHeight() + scrollY);
}

// Retrieve the rendered width of an element
function getObjectWidth(objId)  {
    var elem = document.getElementById(objId);
    var result = 0;
    if (elem.offsetWidth) {
        result = elem.offsetWidth;
    } else if (elem.clip && elem.clip.width) {
        result = elem.clip.width;
    } else if (elem.style && elem.style.pixelWidth) {
        result = elem.style.pixelWidth;
    }
    return parseInt(result, 10);
}

// Retrieve the rendered height of an element
function getObjectHeight(obj_id)  {
    var elem = document.getElementById(obj_id);
    var result = 0;
    if (elem.offsetHeight) {
        result = elem.offsetHeight;
    } else if (elem.clip && elem.clip.height) {
        result = elem.clip.height;
    } else if (elem.style && elem.style.pixelHeight) {
        result = elem.style.pixelHeight;
    }
    return parseInt(result, 10);
}

// Return the available content width space in browser window
// Note: under Firefox, Safari & Opera the scroller width will be included.
function getInsideWindowWidth( ) {
    if (window.innerWidth) {
        return window.innerWidth;
    } else if( document.documentElement && ( document.documentElement.clientWidth ) ) {
      //IE 6+ in 'standards compliant mode'
      return document.documentElement.clientWidth;
    } else if (document.body && document.body.clientWidth) {
        return document.body.clientWidth;
    } else if (document.body && document.body.parentElement) {
        return document.body.parentElement.clientWidth;
    }
    return 0;
}

// Return the available content height space in browser window
// Note: under Safari & Opera the scroller height will be included.
function getInsideWindowHeight( ) {
    if (window.innerHeight) {
        return window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientHeight ) ) {
      //IE 6+ in 'standards compliant mode'
      return document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight) {
        return document.body.clientHeight;
    } else if (document.body && document.body.parentElement) {
        // measure the html element's clientHeight
        return document.body.parentElement.clientHeight;
    }
    return 0;
}

function getEventObj(evt) {
    var eventObj = null;

    if (typeof evt != typeof undefined && evt != null) {
        eventObj = evt;
    } else if (typeof event != typeof undefined && event != null) {
        eventObj = event;
    }

    return eventObj;
}

/*
 * RegExp for replacing spaces by &nbsp; escape sequence.
 */
MoireHelper.prototype.spacesRegExp = new RegExp(" ", "g");
/*
 * The user browser name.
 */
MoireHelper.prototype.userAgent = navigator.userAgent.toLowerCase();

// browser engine name
MoireHelper.prototype.isGecko        = (MoireHelper.prototype.userAgent.indexOf('gecko') != -1 && MoireHelper.prototype.userAgent.indexOf('safari') == -1);
MoireHelper.prototype.isAppleWebKit  = (MoireHelper.prototype.userAgent.indexOf('applewebkit') != -1);

// browser name
MoireHelper.prototype.isKonqueror    = (MoireHelper.prototype.userAgent.indexOf('konqueror') != -1);
MoireHelper.prototype.isSafari       = (MoireHelper.prototype.userAgent.indexOf('safari') != - 1);
MoireHelper.prototype.isOmniweb      = (MoireHelper.prototype.userAgent.indexOf('omniweb') != - 1);
MoireHelper.prototype.isOpera        = (MoireHelper.prototype.userAgent.indexOf('opera') != -1);
MoireHelper.prototype.isIcab         = (MoireHelper.prototype.userAgent.indexOf('icab') != -1);
MoireHelper.prototype.isAol          = (MoireHelper.prototype.userAgent.indexOf('aol') != -1);
MoireHelper.prototype.isIE           = (MoireHelper.prototype.userAgent.indexOf('msie') != -1 && !MoireHelper.prototype.isOpera && (MoireHelper.prototype.userAgent.indexOf('webtv') == -1) );
MoireHelper.prototype.isFirefox      = (MoireHelper.prototype.isGecko && MoireHelper.prototype.userAgent.indexOf('firefox') != -1);
MoireHelper.prototype.isNS           = ((MoireHelper.prototype.isGecko) ? (MoireHelper.prototype.userAgent.indexOf('netscape') != -1) : ( (MoireHelper.prototype.userAgent.indexOf('mozilla') != -1) && !MoireHelper.prototype.isOpera && !MoireHelper.prototype.isSafari && (MoireHelper.prototype.userAgent.indexOf('spoofer') == -1) && (MoireHelper.prototype.userAgent.indexOf('compatible') == -1) && (MoireHelper.prototype.userAgent.indexOf('webtv') == -1) && (MoireHelper.prototype.userAgent.indexOf('hotjava') == -1) ));
MoireHelper.prototype.isMozilla      = (MoireHelper.prototype.isGecko && !MoireHelper.prototype.isFirefox && !MoireHelper.prototype.isNS);
// spoofing and compatible browsers
MoireHelper.prototype.isIECompatible = ( (MoireHelper.prototype.userAgent.indexOf('msie') != -1) && !MoireHelper.prototype.isIE);
MoireHelper.prototype.isNSCompatible = ( (MoireHelper.prototype.userAgent.indexOf('mozilla') != -1) && !MoireHelper.prototype.isNS && !MoireHelper.prototype.isMozilla);

// browser version
MoireHelper.prototype.browserVersion = parseFloat(navigator.appVersion);

/*
 * MoireHelper is intended for doing some preparatory actions before moire showing.
 */
function MoireHelper() {
    /****************************************** BEGIN PROPERTIES ******************************************/
    /*
     * All select controls of page.
     */
    this.pageSelects = document.getElementsByTagName("body")[0].getElementsByTagName("select");
    /*
     * Collection of elements to show insted of {@link #pageSelects} under moire.
     */
    this.controlsInsteadOfSelects = new Array();
    /*
     * Window resize handler set before replacing by {@link #setWindowResizeHandler}.
     */
    this.previousWindowResizeHandler = window.onresize;
    /*
     * Flag to determine whether window resize handler was modified or not.
     */
    this.windowResizeHandlerChanged = false;
    /****************************************** END PROPERTIES ******************************************/

    /****************************************** BEGIN PUBLIC METHODS ******************************************/
    /*
     * Hides page selects controls showing appropriate controls from {@link #controlsInsteadOfSelects} collection. To
     * show hided selects {@link #showPageSelects} should be used.
     */
    this.hidePageSelects = function() {
        this.fillControlsInsteadOfSelectsArray();

        for (var i = 0; i < this.pageSelects.length; i++) {
            var currentSelectScrollTop = this.pageSelects[i].scrollTop;

            hideElement(this.pageSelects[i]);
            this.showElement(this.controlsInsteadOfSelects[i]);

            this.controlsInsteadOfSelects[i].scrollTop = currentSelectScrollTop;
        }
    }

    /*
     * Hides controls displayed by {@link #hidePageSelects} and shows hidden page selects.
     */
    this.showPageSelects = function() {
        for (var i = 0; i < this.pageSelects.length; i++) {
            hideElement(this.controlsInsteadOfSelects[i]);
            this.showElement(this.pageSelects[i]);
        }
    }

    /*
     * Replaces window resize handler by the specified one. Old handler can be restored later by calling
     * {@link #restoreWindowResizeHandler}.
     */
    this.setWindowResizeHandler = function(handler) {
        if (typeof handler != typeof undefined && handler != null) {
            this.previousWindowResizeHandler = window.onresize;
            window.onresize = handler;
            
            this.windowResizeHandlerChanged = true;
        }
    }

    /*
     * Restores window resize handler replaced by {@link #setWindowResizeHandler}. If {@link #setWindowResizeHandler}
     * has not been called before nothing happens.
     */
    this.restoreWindowResizeHandler = function() {
        if (this.windowResizeHandlerChanged) {
            window.onresize = this.previousWindowResizeHandler;

            this.windowResizeHandlerChanged = false;
        }
    }

    /*
     * Hides border around a week in the calendar on the Enter TT page (if do not do it the border floats when window is
     * resized). Also this method prevents the border showing after moire hiding.
     */
    this.extinguishEnterTTCalendarWeek = function() {
        if (typeof Calendar_calendarTableOut != typeof undefined) {
            Calendar_calendarTableOut();
        }
    }
    /****************************************** END PUBLIC METHODS ******************************************/

    /****************************************** BEGIN PRIVATE METHODS ******************************************/
    /*
     * Displays the specified element as "inline" element of the page.
     */
    this.showElement = function(element) {
        element.style.display = "inline";
    }

    /*
     * Fills {@link #controlsInsteadOfSelects} by elements created instead of selects controls. Instead of one-row
     * selects text inputs are created, instead of multiple-row selects text areas are created. If there is no selects
     * controls on the page nothing is happen. Created elements are appended to selects parent nodes, so select controls
     * should be isolated from other HTML-code in some containers (DIV, table TD).
     */
    this.fillControlsInsteadOfSelectsArray = function() {
        this.controlsInsteadOfSelects = new Array();

        for (var i = 0; i < this.pageSelects.length; i++) {
            var select = this.pageSelects[i];
            var controlInsteadOfSelect = null;

            var defaultClassName = "";
            if (!select.multiple) {
                controlInsteadOfSelect = this.createTextFieldFromSelect(select);
                defaultClassName = "textInputInsteadOfMultipleSelect";
            } else {
                controlInsteadOfSelect = this.createTextAreaFromSelect(select);
                defaultClassName = "textAreaInsteadOfMultipleSelect";
            }

            this.setControlInsteadOfSelectProperties(select, controlInsteadOfSelect, defaultClassName);

            this.appendControlInsteadOfSelect(controlInsteadOfSelect);
            select.parentNode.appendChild(controlInsteadOfSelect);
        }
    }

    /*
     * Creates text input field instead of the specified select. Created text field has style properties of the
     * specified select control and its style property display is "none".
     */
    this.createTextFieldFromSelect = function(selectObj) {
        var textField = document.createElement("input");
        textField.type = "text";

        if (selectObj.selectedIndex >= 0)
            textField.value = selectObj.options[selectObj.selectedIndex].text;

        return textField;
    }

    /*
     * Creates text area instead of the specified select. Created text area has style properties of the  specified
     * select control and its style property display is "none".
     */
    this.createTextAreaFromSelect = function(multipleSelectObj) {
        var textArea = document.createElement("textarea");
        if (multipleSelectObj.size > 0)
            textArea.rows = multipleSelectObj.size;
        this.setTextAreaValueFromSelect(multipleSelectObj, textArea);

        return textArea;
    }

    /*
     * Sets text of the specified textarea using options text of the specified select control object.
     */
    this.setTextAreaValueFromSelect = function(multipleSelectObj, textArea) {
        var multipleSelectOptions = multipleSelectObj.options;
        var multipleSelectOptionsText = "";
        for (var i = 0; i < multipleSelectOptions.length; i++) {
            multipleSelectOptionsText += multipleSelectOptions[i].text;
            multipleSelectOptionsText += "\n";
        }

        if (this.isFirefox) {
            // it is needed to no wrap rows in Firefox
            textArea.innerHTML = multipleSelectOptionsText
                    .substr(0, multipleSelectOptionsText.length - 1)
                    .replace(this.spacesRegExp, "&nbsp;");
        } else {
            textArea.value = multipleSelectOptionsText.substr(0, multipleSelectOptionsText.length - 1);
        }
    }

    /*
     * Copies style and some JavaScript properties of the specified select control to the specified control used for
     * showing under moire. "Display" style property the specified control used for showing under moire is set to "none".
     */
    this.setControlInsteadOfSelectProperties = function(selectObj, controlInsteadOfSelectObj, defaultClassName) {
        this.copyStyleProperties(selectObj.style, controlInsteadOfSelectObj.style);
        this.copyJsProperties(selectObj, controlInsteadOfSelectObj, defaultClassName);

        controlInsteadOfSelectObj.style.display = "none";
        controlInsteadOfSelectObj.style.overflowY = "auto"; // to show text area without scrolling if there is no scrolling in appropriate select control (works only in IE)

        if (this.isIE) { // without this setting fields under moire are shifted so page "floats" (in IE).
            controlInsteadOfSelectObj.style.marginTop =
            controlInsteadOfSelectObj.style.marginBottom = "-1px";
        }

        if (this.isOpera) {
            controlInsteadOfSelectObj.style.lineHeight = "140%";
        }

        controlInsteadOfSelectObj.readOnly = true;

        // Disabling of keys pressing on the control under moire
        controlInsteadOfSelectObj.onkeyup = function(evt) {
            var eventObj = null;

            if (typeof evt != typeof undefined && evt != null) {
                eventObj = evt;
            } else if (typeof event != typeof undefined && event != null) {
                eventObj = event;
            }

            eventObj.cancelBubble = true;

            return false;
        };
    }

    /*
     * Copies propeties of fromStyleObj style to toStyleObj style.
     */
    this.copyStyleProperties = function(fromStyleObj, toStyleObj) {
        toStyleObj.background                = fromStyleObj.background;
        toStyleObj.accelerator               = fromStyleObj.accelerator;
        toStyleObj.background                = fromStyleObj.background;
        toStyleObj.backgroundAttachment      = fromStyleObj.backgroundAttachment;
        toStyleObj.backgroundColor           = fromStyleObj.backgroundColor;
        toStyleObj.backgroundImage           = fromStyleObj.backgroundImage;
        toStyleObj.backgroundPosition        = fromStyleObj.backgroundPosition;
        toStyleObj.backgroundPositionX       = fromStyleObj.backgroundPositionX;
        toStyleObj.backgroundPositionY       = fromStyleObj.backgroundPositionY;
        toStyleObj.backgroundRepeat          = fromStyleObj.backgroundRepeat;
        toStyleObj.behavior                  = fromStyleObj.behavior;
        toStyleObj.border                    = fromStyleObj.border;
        toStyleObj.borderBottom              = fromStyleObj.borderBottom;
        toStyleObj.borderBottomColor         = fromStyleObj.borderBottomColor;
        toStyleObj.borderBottomStyle         = fromStyleObj.borderBottomStyle;
        toStyleObj.borderBottomWidth         = fromStyleObj.borderBottomWidth;
        toStyleObj.borderCollapse            = fromStyleObj.borderCollapse;
        toStyleObj.borderColor               = fromStyleObj.borderColor;
        toStyleObj.borderLeft                = fromStyleObj.borderLeft;
        toStyleObj.borderLeftColor           = fromStyleObj.borderLeftColor;
        toStyleObj.borderLeftStyle           = fromStyleObj.borderLeftStyle;
        toStyleObj.borderLeftWidth           = fromStyleObj.borderLeftWidth;
        toStyleObj.borderRight               = fromStyleObj.borderRight;
        toStyleObj.borderRightColor          = fromStyleObj.borderRightColor;
        toStyleObj.borderRightStyle          = fromStyleObj.borderRightStyle;
        toStyleObj.borderRightWidth          = fromStyleObj.borderRightWidth;
        toStyleObj.borderStyle               = fromStyleObj.borderStyle;
        toStyleObj.borderTop                 = fromStyleObj.borderTop;
        toStyleObj.borderTopColor            = fromStyleObj.borderTopColor;
        toStyleObj.borderTopStyle            = fromStyleObj.borderTopStyle;
        toStyleObj.borderTopWidth            = fromStyleObj.borderTopWidth;
        toStyleObj.borderWidth               = fromStyleObj.borderWidth;
        toStyleObj.bottom                    = fromStyleObj.bottom;
        toStyleObj.clear                     = fromStyleObj.clear;
        toStyleObj.clip                      = fromStyleObj.clip;
        toStyleObj.color                     = fromStyleObj.color;
        toStyleObj.cssText                   = fromStyleObj.cssText;
        toStyleObj.cursor                    = fromStyleObj.cursor;
        toStyleObj.direction                 = fromStyleObj.direction;
        toStyleObj.display                   = fromStyleObj.display;
        //toStyleObj.font                      = fromStyleObj.font; // initiates JavaScript error in IE 6.0
        toStyleObj.fontFamily                = fromStyleObj.fontFamily;
        toStyleObj.fontSize                  = fromStyleObj.fontSize;
        toStyleObj.fontStyle                 = fromStyleObj.fontStyle;
        toStyleObj.fontVariant               = fromStyleObj.fontVariant;
        toStyleObj.fontWeight                = fromStyleObj.fontWeight;
        toStyleObj.height                    = fromStyleObj.height;
        toStyleObj.imeMode                   = fromStyleObj.imeMode;
        toStyleObj.layoutFlow                = fromStyleObj.layoutFlow;
        toStyleObj.layoutGrid                = fromStyleObj.layoutGrid;
        toStyleObj.layoutGridChar            = fromStyleObj.layoutGridChar;
        toStyleObj.layoutGridLine            = fromStyleObj.layoutGridLine;
        toStyleObj.layoutGridMode            = fromStyleObj.layoutGridMode;
        toStyleObj.layoutGridType            = fromStyleObj.layoutGridType;
        toStyleObj.left                      = fromStyleObj.left;
        toStyleObj.letterSpacing             = fromStyleObj.letterSpacing;
        toStyleObj.lineBreak                 = fromStyleObj.lineBreak;
        toStyleObj.lineHeight                = fromStyleObj.lineHeight;
        toStyleObj.listStyle                 = fromStyleObj.listStyle;
        toStyleObj.listStyleImage            = fromStyleObj.listStyleImage;
        toStyleObj.listStylePosition         = fromStyleObj.listStylePosition;
        toStyleObj.listStyleType             = fromStyleObj.listStyleType;
        toStyleObj.margin                    = fromStyleObj.margin;
        toStyleObj.marginBottom              = fromStyleObj.marginBottom;
        toStyleObj.marginLeft                = fromStyleObj.marginLeft;
        toStyleObj.marginRight               = fromStyleObj.marginRight;
        toStyleObj.marginTop                 = fromStyleObj.marginTop;
        toStyleObj.maxHeight                 = fromStyleObj.maxHeight;
        toStyleObj.maxWidth                  = fromStyleObj.maxWidth;
        toStyleObj.minHeight                 = fromStyleObj.minHeight;
        toStyleObj.minWidth                  = fromStyleObj.minWidth;
        toStyleObj.msInterpolationMode       = fromStyleObj.msInterpolationMode;
        toStyleObj.overflow                  = fromStyleObj.overflow;
        toStyleObj.overflowX                 = fromStyleObj.overflowX;
        toStyleObj.overflowY                 = fromStyleObj.overflowY;
        toStyleObj.padding                   = fromStyleObj.padding;
        toStyleObj.paddingBottom             = fromStyleObj.paddingBottom;
        toStyleObj.paddingLeft               = fromStyleObj.paddingLeft;
        toStyleObj.paddingRight              = fromStyleObj.paddingRight;
        toStyleObj.paddingTop                = fromStyleObj.paddingTop;
        toStyleObj.pageBreakAfter            = fromStyleObj.pageBreakAfter;
        toStyleObj.pageBreakBefore           = fromStyleObj.pageBreakBefore;
        toStyleObj.pixelBottom               = fromStyleObj.pixelBottom;
        toStyleObj.pixelHeight               = fromStyleObj.pixelHeight;
        toStyleObj.pixelLeft                 = fromStyleObj.pixelLeft;
        toStyleObj.pixelRight                = fromStyleObj.pixelRight;
        toStyleObj.pixelTop                  = fromStyleObj.pixelTop;
        toStyleObj.pixelWidth                = fromStyleObj.pixelWidth;
        toStyleObj.posBottom                 = fromStyleObj.posBottom;
        toStyleObj.posHeight                 = fromStyleObj.posHeight;
        toStyleObj.position                  = fromStyleObj.position;
        toStyleObj.posLeft                   = fromStyleObj.posLeft;
        toStyleObj.posRight                  = fromStyleObj.posRight;
        toStyleObj.posTop                    = fromStyleObj.posTop;
        toStyleObj.posWidth                  = fromStyleObj.posWidth;
        toStyleObj.right                     = fromStyleObj.right;
        toStyleObj.rubyAlign                 = fromStyleObj.rubyAlign;
        toStyleObj.rubyOverhang              = fromStyleObj.rubyOverhang;
        toStyleObj.rubyPosition              = fromStyleObj.rubyPosition;
        toStyleObj.scrollbar3dLightColor     = fromStyleObj.scrollbar3dLightColor;
        toStyleObj.scrollbarArrowColor       = fromStyleObj.scrollbarArrowColor;
        toStyleObj.scrollbarBaseColor        = fromStyleObj.scrollbarBaseColor;
        toStyleObj.scrollbarDarkShadowColor  = fromStyleObj.scrollbarDarkShadowColor;
        toStyleObj.scrollbarFaceColor        = fromStyleObj.scrollbarFaceColor;
        toStyleObj.scrollbarHighlightColor   = fromStyleObj.scrollbarHighlightColor;
        toStyleObj.scrollbarShadowColor      = fromStyleObj.scrollbarShadowColor;
        toStyleObj.scrollbarTrackColor       = fromStyleObj.scrollbarTrackColor;
        toStyleObj.styleFloat                = fromStyleObj.styleFloat;
        toStyleObj.tableLayout               = fromStyleObj.tableLayout;
        toStyleObj.textAlign                 = fromStyleObj.textAlign;
        toStyleObj.textAlignLast             = fromStyleObj.textAlignLast;
        toStyleObj.textAutospace             = fromStyleObj.textAutospace;
        toStyleObj.textDecoration            = fromStyleObj.textDecoration;
        toStyleObj.textDecorationBlink       = fromStyleObj.textDecorationBlink;
        toStyleObj.textDecorationLineThrough = fromStyleObj.textDecorationLineThrough;
        toStyleObj.textDecorationNone        = fromStyleObj.textDecorationNone;
        toStyleObj.textDecorationOverline    = fromStyleObj.textDecorationOverline;
        toStyleObj.textDecorationUnderline   = fromStyleObj.textDecorationUnderline;
        toStyleObj.textIndent                = fromStyleObj.textIndent;
        toStyleObj.textJustify               = fromStyleObj.textJustify;
        toStyleObj.textKashidaSpace          = fromStyleObj.textKashidaSpace;
        toStyleObj.textOverflow              = fromStyleObj.textOverflow;
        toStyleObj.textTransform             = fromStyleObj.textTransform;
        toStyleObj.textUnderlinePosition     = fromStyleObj.textUnderlinePosition;
        toStyleObj.top                       = fromStyleObj.top;
        toStyleObj.unicodeBidi               = fromStyleObj.unicodeBidi;
        toStyleObj.verticalAlign             = fromStyleObj.verticalAlign;
        toStyleObj.visibility                = fromStyleObj.visibility;
        toStyleObj.whiteSpace                = fromStyleObj.whiteSpace;
        toStyleObj.width                     = fromStyleObj.width;
        toStyleObj.wordBreak                 = fromStyleObj.wordBreak;
        toStyleObj.wordSpacing               = fromStyleObj.wordSpacing;
        toStyleObj.wordWrap                  = fromStyleObj.wordWrap;
        toStyleObj.writingMode               = fromStyleObj.writingMode;
        toStyleObj.zIndex                    = fromStyleObj.zIndex;
        toStyleObj.zoom                      = fromStyleObj.zoom;
    }

    /*
     * Copies some JavaScript properties fromObj object to toObj object. If the specified project to copy properties
     * from has no CSS class name the specified defaultClassName is set for toObj.
     */
    this.copyJsProperties = function(fromObj, toObj, defaultClassName) {
        if (isNotEmpty(fromObj.className)) {
            toObj.className = fromObj.className;
        } else {
            toObj.className = defaultClassName;
        }

        toObj.style.width = fromObj.offsetWidth;
        toObj.style.height = fromObj.offsetHeight;
    }

    /*
     * Appends the specified control to {@link controlsInsteadOfSelects}.
     */
    this.appendControlInsteadOfSelect = function(controlInsteadOfSelect) {
        this.controlsInsteadOfSelects[this.controlsInsteadOfSelects.length] = controlInsteadOfSelect;
    }
    /****************************************** END PRIVATE METHODS ******************************************/
}

/*
 * ImagePreloader is intended for the specified images preloading. It is needed for seeing them without visible waiting.
 * After images loading callback function is called (if it is specified).
 *
 * @param images - array of image file names.
 * @param callback - JavaScript function to call after images loading.
 * @see - http://www.webreference.com/programming/javascript/gr/column3/
 */
function ImagePreloader(images, callback) {
    // store the callback
    this.callback = callback;

    // initialize internal state.
    this.nLoaded = 0;
    this.nProcessed = 0;
    this.aImages = new Array();

    // record the number of images.
    this.nImages = images.length;

    // for each image, call preload()
    for (var i = 0; i < images.length; i++) {
        this.preload(images[i]);
    }
}

ImagePreloader.prototype.preload = function(image) {
    // create new Image object and add to array
    var oImage = new Image();
    this.aImages.push(oImage);

    // set up event handlers for the Image object
    oImage.onload = ImagePreloader.prototype.onload;
    oImage.onerror = ImagePreloader.prototype.onerror;
    oImage.onabort = ImagePreloader.prototype.onabort;

    // assign pointer back to this.
    oImage.oImagePreloader = this;
    oImage.bLoaded = false;

    // assign the .src property of the Image object
    oImage.src = image;
}


ImagePreloader.prototype.onComplete = function() {
    this.nProcessed++;

    if (this.nProcessed == this.nImages &&
        typeof this.callback != typeof undefined && this.callback != null) {

        this.callback(this.aImages, this.nLoaded);
    }
}

ImagePreloader.prototype.onload = function() {
    this.bLoaded = true;
    this.oImagePreloader.nLoaded++;
    this.oImagePreloader.onComplete();
}

ImagePreloader.prototype.onerror = function() {
    this.bError = true;
    this.oImagePreloader.onComplete();
}

ImagePreloader.prototype.onabort = function() {
    this.bAbort = true;
    this.oImagePreloader.onComplete();
}

// disables text selection in the specified element in IE and FF
function disableTextSelection(element)
{
    element.onselectstart = function() { return false; };
    element.ondragstart = function() { return false; };
    element.unselectable = "on";
    element.style.MozUserSelect = "none";
    element.style.cursor = "default";
}

function spentTimeIsInvalid(spentTime)
{
    return spentTime == null || spentTime < 0;
}

function leadZero(n)
{
    if(n < 10)
        return '0' + n;
    else
        return '' + n;
}

function areCookiesEnabled()
{
    document.cookie="cookies=true";
    return document.cookie ? true : false;
}

/**
 * Determines which mouse button was pressed.
 * @param event - the event object from the onmousedown event handler (it may work in some other events, too)
 */
function whichButtonPressed(event)
{
    if (event.which == null)
       /* IE case */
       return (event.button < 2) ? "left" :
                 ((event.button == 4) ? "middle" : "right");
    else
       /* All others */
       return (event.which < 2) ? "left" :
                 ((event.which == 2) ? "middle" : "right");
}

function setElementInnerHTML(elementId, html)
{
    document.getElementById(elementId).innerHTML = html;
}


/**
 * @param buttonGroup - radio button group
 * @return the array number of the selected radio button or -1 if no button is selected
 */
function getSelectedRadio(buttonGroup) {

   if (buttonGroup[0]) { // if the button group is an array (one button is not an array)
      for (var i=0; i<buttonGroup.length; i++) {
         if (buttonGroup[i].checked) {
            return i
         }
      }
   } else {
      if (buttonGroup.checked) { return 0; } // if the one button is checked, return zero
   }
   // if we get to this point, no radio button is selected
   return -1;
}


/**
 * @param buttonGroup - radio button group
 * @return the value of the selected radio button or null if no button is selected
 */
function getSelectedRadioValue(buttonGroup) {
   //
   var i = getSelectedRadio(buttonGroup);
   if (i == -1) {
      return null;
   } else {
      if (buttonGroup[i]) { // Make sure the button group is an array (not just one button)
         return buttonGroup[i].value;
      } else { // The button group is just the one button, and it is checked
         return buttonGroup.value
      }
   }
}
/**
 * Finds element with specified name at form.
 * @param form - js object form to search element
 * @param name of the element
 * @return element object
 */
function findFormElementByName(form, name) {
    return form.elements[name];
}

/**
 * function to added listener to specified element 
 */
 function addListener(element, event, listener)
{
    if (element.addEventListener)
        element.addEventListener(event, listener, false);
    else
        element.attachEvent('on' + event, listener);
};

/**
 * function to remove listener from specified element
 */
 function removeListener(element, event, listener)
{
    if (element.removeEventListener)
        element.removeEventListener(event, listener, false);
    else
        element.detachEvent('on' + event, listener);
}

function stopEventPropagation(event)
{
    if (event.stopPropagation)
    {
        event.stopPropagation();
    }
    else
    {
        event.cancelBubble = true;
    }
}

/**
 * Creates Date object.
 * Use this function to avoid "smart" date conversion for DST.
 *
 * @param year - year of date
 * @param month - month of date
 * @param day - day of date
 * @return Date object
 */
function newDate(year, month, day)
{
    //12:00 is specified to avoid date conversion for DST
    return new Date(year, month, day, 12, 0);
}

/**
 * Compare two dates only by "date" part, excluding "time" part
 * @param date1
 * @param date2
 */
function areDatesEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Gets target DOM element of specified event.
 *
 * @param event - event
 * @return object DOM element
 */
function getTargetElement( event )
{
    if (event.toElement) { //IE
        return event.toElement;
    } else if (event.relatedTarget) { //other browsers
        return event.relatedTarget;
    }
}

/**
 * Gets cookie value.
 * Note: return null if cookie not found or cookies disabled.
 *
 * @param name - cookie name
 * @return cookie value
 */
function getCookie(name)
{
    var cookies = document.cookie.split('; ');
    for (var index = 0; index < cookies.length; index++)
    {
        var nameValPair = cookies[index].split('=');
        if (name == nameValPair[0])
            return nameValPair[1];
    }
    return null;
}

/**
 * Saves value with specified cookie name.
 * Delete cookie if value is null.
 * Note: do nothing if cookies disabled.
 *
 * @param name - cookie name
 * @param value - saving value
 */
function setCookie( name, value, path )
{
    //current time
    var expireDate = new Date();
    if( value != null )
    {
        //current time + ~10 years
        expireDate = new Date(expireDate.getTime() + 310000000000);
    }
    document.cookie = [ name, "=", value, ";expires=", expireDate.toGMTString(), ( path ) ? ";path=" + path : "" ].join("");
}

function applyToSingleOrEach(singleOrCollection, func)
{
    if (!singleOrCollection)
        return;

    if (singleOrCollection.length != undefined)
    {
        for (var i = 0; i < singleOrCollection.length; i++)
            func(singleOrCollection[i], i);
    }
    else
    {
        func(singleOrCollection, 0);
    }
}

function applyToSingleOrIndexed(singleOrCollection, index, func)
{
    if (singleOrCollection.length != undefined)
    {
        func(singleOrCollection[index]);
    }
    else
    {
        if (index == 0)
            func(singleOrCollection);
        else
            throw "Not a collection, but non-zero index was given";
    }
}

function applyToSingleOrLast(singleOrCollection, func)
{
    if (singleOrCollection.length != undefined)
    {
        func(singleOrCollection[singleOrCollection.length - 1]);
    }
    else
    {
        func(singleOrCollection);
    }
}


/**
 * Returns actual width of the window by the width of the content to fit inside
 * when the browser supports this (IE does NOT so the result will be equal to the passed value).
 * May be used for window resizing
 */
function getCorrectedWidth(width)
{
    if( typeof( window.innerWidth ) == 'number' )
        //FF
        return width + window.outerWidth - window.innerWidth;
    return width;
}

/**
 * Returns actual height of the window by the height of the content to fit inside
 * when the browser supports this (IE does NOT so the result will be equal to the passed value).
 * May be used for window resizing
 */
function getCorrectedHeight(height)
{
    if( typeof( window.innerHeight ) == 'number' || typeof( window.outerHeight ) == 'number')
        //FF
        return height + window.outerHeight - window.innerHeight;
    return height;
}

/**
 * Resizes the browser window to fit specified size of the content
 * width and height parameters may be null in this case corresponding
 * dimension will not be affected
 * Note: actual size of the window depends on browser and its settings
 * Note: window will not be resized if it's bigger than needed
 */
function adaptiveWindowResize(width, height)
{
    var innerWidth  = getInsideWindowWidth();
    var innerHeight = getInsideWindowHeight();
    width = (width == null) ? innerWidth : width;
    height = (height == null) ? innerHeight : height;

    //we don't need to shrink the popups so resizing won't be applied to the bigger ones
    if (width > innerWidth || height > innerHeight)
        resizeWindow(width, height);
}

/**
 * Resizes the browser window to fit specified size of the content
 * Note: actual size of the window depends on browser and its settings
 */
function resizeWindow(width, height)
{
    //when possible it's better to calculate real window size then to resize twice
    window.resizeTo(getCorrectedWidth(width), getCorrectedHeight(height));

    //if we didn't get the expected result after the first resizing
    //we can calculate the difference and resize again (IE)
    var newWidth  = getInsideWindowWidth();
    var newHeight = getInsideWindowHeight();
    if (width != newWidth, height != newHeight)
        window.resizeTo(width + (width - newWidth), height + (height - newHeight));
}


/**
 * Resizes the browser window using {@link #adaptiveWindowResize} function
 * after the page is loaded. For the parameters description see {@link #adaptiveWindowResize}
 */
function adaptiveResizeAfterLoad(width, height)
{
    var callback = function()
    {
        adaptiveWindowResize(width, height);
    };

    addListener(window, "load", callback);
}

/**
 * Makes browser show a confirmation message before any navigation when
 * isConfirmationOnUnloadRequired() == true
 * @param message confirmation message that will be shown when user would try to close the popup or navigate to another page
 * @param isConfirmationOnUnloadRequired a callback method that must always return true when we need to show confirmation before any navigation and false otherwise
 */
function setUpExitConfirmation(message, isConfirmationOnUnloadRequired)
{
    var confirmationEnabled = true;
    var confirmExit = function()
    {
        if (confirmationEnabled && isConfirmationOnUnloadRequired())
        {
            return message;
        }
    };

    var disableConfirmation= function()
    {
        confirmationEnabled = false;
    };

    window.onbeforeunload = confirmExit;

    //after a navigation in the parent window it would try to close all the popups
    //opened from it. In this case popups shall be closed without any confirmations
    /* TODO:
     * the call of the EventListener causes an error in FF7 if parent window needs to be reload after popup is closed.
     * confirmationEnabled and disableConfirmation should be moved outside of this function in order to allow to
     * remove EventListener from parent window before popup closes. This is required, because to remove EventListener
     * you need to specify the same function you setup as a listener
     * For more information refers to Bug 33983: FF7: JS error when Edit Open Task or Create New Tasks pop-up is closed
     */
    addListener(window.opener, "beforeunload", disableConfirmation);
}

/**
 * Unlike just calling submit() method of a form, it notifies listeners
 */
function notifyAndSubmit(form)
{
    if (form.fireEvent) //IE
    {
        form.fireEvent("onsubmit", event);
        form.submit();
    }
    else if(form.dispatchEvent) //other browsers
    {
        var event = form.ownerDocument.createEvent('HTMLEvents');
        event.initEvent("submit", false, true);
        form.dispatchEvent(event);
        if (!Event.SUBMIT) //Safari & Chrome
		    form.submit();
    }
}


/**
 * Makes DOM node invisible and then after timeout removes it
 */
function removeElementWithTimeout(domElement, timeout)
{
    addClass(domElement, 'invisible');
    setTimeout(function()
    {
        domElement.parentNode.removeChild(domElement);
    }, timeout)
}

 /**
  * Sets focus to the passed DOM element
  */
function focusElement(elem)
{
    setTimeout(function()
    {
        elem.focus();
    })
}

function isSameOrParentOf(elem, checkElem)
{
    var currentElem = elem;
    while (currentElem)
    {
        if (currentElem == checkElem)
            return true;
        currentElem = currentElem.parentNode;
    }
    return false;
}

function hideFocusForLinks( elem ) {
    var links = elem.getElementsByTagName("a");
    var length = links.length;
    for( var i = 0; i < length; i++ )
        links[i].hideFocus = true;
}