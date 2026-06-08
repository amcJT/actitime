

/*
 * Page is needed for JavaScript files where XmlHttpRequest object is needed. This file should be included in these
 * pages by jsp:include action.
 */


/*------------------------------------------------- CONSTANTS -------------------------------------------------*/

/*
 * Request ready statuses.
 */
var UNINITIALIZED = 0;
var LOADING       = 1;
var LOADED        = 2;
var INTERACTIVE   = 3;
var COMPLETED     = 4;

/*
 * Request status codes.
 */
var OK_STATUS = 200;
var BAD_REQUEST_STATUS = 400;
var HTTP_VERSION_NOT_SUPPORTED_STATUS = 505;

/*
 * Request method constants.
 */
var GET_REQUEST  = "GET";
var POST_REQUEST = "POST";

/*------------------------------------------------- FUNCTIONS -------------------------------------------------*/
/*-------------------------------------------------  PUBLIC  -------------------------------------------------*/

/*
 * Creates XMLHttpRequest object.
 * Returns created object or null, if XMLHttpRequest is not supported.
 */
function createRequestObject() {
    var request = null;

    try {
        request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e){}
    if(!request) try {
        request = new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e){}
    if(!request) try {
        request = new XMLHttpRequest();
    } catch (e){}

    return request;
}

/*
 * Timeout (in ms) between requests to refresh user session.
 */
var REFRESH_TIMEOUT = 60*60*1000; // one hour in ms.

/*
 * Determines whether an error has been already handled before or not.
 * See refreshSession().
 */
var ERROR_WAS_HANDLED = false;

/**
 * Sets timer for delayed call refreshSession() function. Timeout value equals REFRESH_TIMEOUT.
 */
function delayedRefreshSession()
{
    var func = function() { refreshSession(); };
    window.setTimeout(func, REFRESH_TIMEOUT);
}

/*
 * Do GET-request to refresh user session with REFRESH_TIMEOUT interval.
 */
function refreshSession() {
    var request = createRequestObject();
    if (request == null) {
        return;
    }

    try {
        request.open(GET_REQUEST, REFRESH_SESSION_URL, true);
        request.onreadystatechange = function (aEvt) {
            if (request.readyState == COMPLETED) {
                delayedRefreshSession();
                try {
                    if (isHandledError(request.status)) {
                        ERROR_WAS_HANDLED = true;
                        showMessageForReceivedStatusCode();
                    } else if (request.status == OK_STATUS) {
                        ERROR_WAS_HANDLED = false;
                    }
                } catch (e) {
                    // Can be throw when server is not available, in this case statement request.status throws exception.
                }
            }
        };
        request.send(null);
    } catch (e) {
        // Can be thrown when user works offline and XMLHttpRequest object attempts to send request.
    }
}

/*
 * Determine whether specified status code should be handled.
 *
 * status - the code of status of the request retrieved from the server.
 * return true if retrieved status code is a Client Error 4xx code or Server Error 5xx code and false otherwise.
 */
function isHandledError(status) {
    return !ERROR_WAS_HANDLED &&
           status >= BAD_REQUEST_STATUS &&
           status < HTTP_VERSION_NOT_SUPPORTED_STATUS;
}

/*
 * Displays pop-up message box explaining retrieved status code.
 */
function showMessageForReceivedStatusCode() {
    alert("The system detected that actiTIME server is unavailable.\n" +
          "Your session might have been expired.");
}

delayedRefreshSession();