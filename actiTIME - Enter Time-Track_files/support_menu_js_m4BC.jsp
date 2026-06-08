

function highlight(el) {
    el.className += " highlighted";
}

function toneDown(el) {
    el.className = el.className.replace(/\s?highlighted/, "");
}

function switchOffNewsUpdatesIndicator() {
    var exclamation = document.getElementById("newsUpdatesExclamation");
    if(exclamation != null){
        // Removes exclamation mark from menu
        exclamation.parentNode.removeChild(exclamation);
    }

    // Also clear menu title
    document.getElementById("newsUpdatesMenuItem").title = "";
}

function showDialog(popup) {
    setBodyCursor("progress");
    window.setTimeout(function () {
                          popup.show();
                          setBodyCursor("default");
                      }, 200);
}

/*
 * Sets the specified type of cursor for HTML body. If user's browser is Firefox nothing is happen because changing
 * cursor style initiates filling empty multiple selects by "strange" option "XX".
 */
function setBodyCursor(cursorType) {
    if (!MoireHelper.prototype.isFirefox) { // without this condition empty multiple selects got strange option "XX" (only in Firefox)
        document.body.style.cursor = cursorType;
    }
}

function menuItemHandler_About() {
    showDialog(aboutPopup);
}

function menuItemHandler_Mobile() {
    openActitimeMobilePage();
}

function menuItemHandler_QuickBooks() {
    openQuickBooksPage();
}

function menuItemHandler_CleanupDemoData() {
    showDialog(cleanupDemoDataPopup);
}

/************************************************ BUG REPORT ************************************************/


/**
 * Opens "Report Bug" popup window
 *
 * @param displayException if true exception information is displayed as bug description
 */
function openReportBugPopup(displayException) {

    var url = '/support/forms/reportBug.jsp';

    // If display last exception option was specified include the option into url
    if(displayException){

        url += '?exc';
    }

    
    var reportBugPopup = window.open(url, "reportBugWnd" + new Date().getTime(),
        "directories=no,height=610, width=560, location=no, menubar=no, resizable=yes, scrollbars=no, " +
        "status=yes, titlebar=yes, toolbar=no");

    if (reportBugPopup == null)
        alert("Please disable pop-up blocker for actiTIME.")
    else
        reportBugPopup.focus();
}

/**
 * Opens "Report Bug" popup window with exception description prefilled into
 * bug description text area
 */
function sendExceptionReport() {
    openReportBugPopup(true);
}

/**
 * Handler for "Report Bug" support menu item click event
 */
function menuItemHandler_ReportABug() {
    openReportBugPopup(false);
}



function menuItemHandler_Faq() {
    
   windowOpen('/support/popups/faqPopup.jsp', "faqWnd",
        "directories=no,height=500, width=830, location=no, menubar=no, resizable=yes, scrollbars=no, " +
        "status=yes, titlebar=yes, toolbar=no");
}

function menuItemHandler_RequestAnAdditionalFeature() {
    windowOpen('/support/forms/requestFeature.jsp', 'submitQuestionWnd' + new Date().getTime(),
        'directories=no,height=590, width=560, location=no, menubar=no, resizable=yes, scrollbars=no, status=yes, titlebar=yes, toolbar=no');
}

function menuItemHandler_NewsAndUpdates() {
    
    openNewsAndUpdates();
}

function menuItemHandler_SendAQuestionToVendor() {
    openFormInNewWindow(null);
}

function menuItemHandler_UserGuide() {
    openUserGuidePage( "index.html" );
}

function openUserGuidePage( page ) {
     popup("/userguide/"+page, "userGuideWnd_" + (new Date()).getUTCMilliseconds(),
           830, 500, "no", "no", false, false);
}



/**
 * Opens "Submit Question" form in new window
 * @param prefilledText text to prefill for question
 */
function openFormInNewWindow(prefilledText){

    // Must use full URL since the form is opened from CRM pages         
    var url = 'http://192.168.2.157:8001/support/forms/submitQuestion.jsp';

    if(prefilledText != null){
        url += '?text=' + encodeURIComponent(prefilledText);
    }

    window.open(url, 'submitQuestionWnd' + new Date().getTime(),
        'directories=no,height=590, width=560, location=no, menubar=no, resizable=yes, scrollbars=no, status=yes, titlebar=yes, toolbar=no');
}
