

// defines how many levels of nested elements should be checked
// in exitHandler() function when detecting if <a> element's been clicked
var LINK_SEARCH_DEPTH = 2;

// is true when moire is displayed and clicks are blocked
var blockClicks = false;
// array of controls where changes are monitored
var controls = new Array();
var index = 0;
var formModified = false;
var buttonHilightColor = "#fff6c6";
var borderHilightColor = "#f4b700";
var buttonHilightBackgroundImage = "url(/img/default/not_saved_bg.gif?hash=797059755)";
var hilightChanges = true;
var submitMethod = undefined;
var discardMethod = undefined;
var cancelMethod = undefined;
var exitModifiedCallback = undefined;

var confirmDlg = undefined;
var validateFunction = undefined;

var formOnChangedCallback = undefined;

function registerChangeableControl(control)
{
    controls[index++] = control;
}

function registerFormChangeCallback(callback)
{
  formOnChangedCallback = callback;
}

function handleChange(shouldDeleteMessages)
{
    if(formModified)
    {
        if(hilightChanges && shouldDeleteMessages)
        {
            hideMessages();
        }
        return;
    }
    formModified = true;
    if(document.forms[0].elements.formDataModified)
        document.forms[0].elements.formDataModified.value = "true";
    if(hilightChanges)
    {
        hilightButtonPane();
        showModifiedDiv();
        if(shouldDeleteMessages)
            hideMessages();
    }
}

function hideMessages()
{
    makeElementByIdInvisible("MessagesTable");
}

function hideErrors()
{
    makeElementByIdInvisible("ErrorsTable");
}

function makeElementByIdInvisible(id)
{
    var tbl = document.getElementById(id);
    if(tbl)
        tbl.style.visibility = "hidden";

}

function deleteMessages()
{
    if(document.getElementById("MessagesTable"))
    {
        document.getElementById("MessagesTable").style.display = "none";
    }
}

function isLink(e, target){
    var target;
    if(typeof(target) == typeof(undefined)){
        target = e ? e.target : (window.event ? window.event.srcElement : null);
    }

    if( typeof(target.hash) != typeof(undefined) && typeof(target.host) != typeof(undefined) &&
        typeof(target.search) != typeof(undefined) && typeof(target.protocol) != typeof(undefined)){
           return true;
    }
    return false;
}


function onKeyUpChangeableHandler(evt){
    if(!isLink(evt))
        changeableHandler(evt);
}

function changeableHandler(evt)
{
    if (formOnChangedCallback != undefined)
    {
       formOnChangedCallback();
    }

    if (!formModified)
    {
        for(i = 0; i < controls.length; i++)
        {
            if(controls[i] == undefined)
            {
                continue;
            }

            if(controls[i].defaultValue != undefined || controls[i].defaultValue == '')
            {
                if(controls[i].value != controls[i].defaultValue)
                {
                    handleChange(true);
                    break;
                }
            }
            if(controls[i].defaultChecked != undefined)
            {
                if(controls[i].checked != controls[i].defaultChecked)
                {
                    handleChange(true);
                    break;
                }
            }
            if(controls[i].options)
            {
                for(j = 0; j < controls[i].options.length; j++)
                {
                    if(controls[i].options[j].selected != controls[i].options[j].defaultSelected)
                    {
                        handleChange(true);
                        break;
                    }
                }
            }
        }
    }
}

function showModifiedDiv()
{
    var element = document.getElementById("FormModifiedDiv");
    if(element && element.style)
    {
        element.style.visibility = "visible";
    }
}

function hilightButtonPane()
{
    var element = document.getElementById("ButtonPane");
    if(element && element.style)
    {
        element.style.backgroundColor = buttonHilightColor;
        element.style.borderColor = borderHilightColor;
        element.style.backgroundImage = buttonHilightBackgroundImage;
    }
}

function setSubmitHandler(submitFunction)
{
    if(submitFunction != undefined)
    {
        submitMethod = submitFunction;
    }
}

function setDiscardHandler(discardFunction)
{
    if(discardFunction != undefined)
    {
        discardMethod = discardFunction;
    }
}

function setCancelHandler(cancelFunction)
{
    if(cancelFunction != undefined)
    {
        cancelMethod = cancelFunction;
    }
}

function registerFormChangedHandlers(hilight)
{
    hilightChanges = hilight;
    document.body.onchange = changeableHandler;
    document.body.onkeyup = onKeyUpChangeableHandler;
    subscribeChangeAndExitHandlersOnMouseClick();

    if(document.forms[0].formDataModified)
    {
        if(document.forms[0].formDataModified.value == "true")
        {
            handleChange(false);
        }
    }
}

function cancelForm(message, href)
{
    if(formModified)
    {
        if(confirm(message))
            document.location.href = href
    } else
        document.location.href = href;
}

function textFieldChanged(textField)
{
    if(textField.value != textField.defaultValue)
    {
        handleChange(true);
    }
}

function showConfirmExitDlg()
{
    setRedirectUrl("");
    blockClicks = true;
    confirmDlg.open();
    KeyDownHandler.setOnKeyDownHandler(function(evt) {handleEscape(remainOnThePage, evt);})
}

function hideConfirmExitDlg()
{
    confirmDlg.close();
    blockClicks = false;

    // restore previous keydown handler
    KeyDownHandler.restoreOnKeyDownHandler()

    if (document.setActive)
        document.setActive();
}

function saveFormChanges()
{
    hideConfirmExitDlg();
    if(submitMethod != undefined)
    {
        submitMethod();
    }
    else
    {
        document.forms[0].submit();
    }
}

function discardFormChanges()
{
    hideConfirmExitDlg();
    var redirect = true;
    if(validateFunction != undefined)
        redirect = validateFunction();

    if(redirect)
    {
        if(discardMethod != undefined)
        {
            discardMethod();
        }
        else
        {
            window.location.href = getRedirectUrl();
        }
    }
}

function remainOnThePage()
{
    hideConfirmExitDlg();
    setRedirectUrl("");
    if(cancelMethod != undefined)
    {
        cancelMethod();
    }
}

// check if clicked leads outside and display a message.
function exitHandler(e)
{
     var target = e ? e.target : (window.event ? window.event.srcElement : null);
     var evt = e ? e : (window.event ? window.event : null);
     if(target == null) return false;

     if(blockClicks && !(target.type && target.type == "button"))
        return false;
     // ignore clicks on everything but the <a> elements

     //IE4
     if(document.all)
     {
         // this is a link image. check if parent is an <a>
         if(target.src == target.href) {
             target = target.parentElement;
         }
         if(target == null) return false;
     }

    if( target.src && typeof(target.hspace) != undefined && typeof(target.vspace) != undefined && target.parentNode )
    {
        var counter = 0;
        while( (counter < LINK_SEARCH_DEPTH) && target && !target.href )
        {
            target = target.parentNode;
        }
    }

     if(target == null) return false;

     // get rid off non-links, javascripts, non-hrefs, targeted links and onclicks
     if(!target.href || target.href == window.location.href || target.href == (window.location.href + '#') ||
        target.href.substr(0, 11).toLowerCase() == "javascript:" ||  target.target || target.onclick)
     {
        return true;
     }

     var modified = checkModified();
     if(modified) {
        showConfirmExitDlg();
        setRedirectUrl(target.href);
        evt.returnValue = false;
        if(evt.preventDefault != undefined)
            evt.preventDefault();
        return false;
     }
}

function setExitHandler(callback)
{
    exitModifiedCallback = callback;
}

function subscribeChangeAndExitHandlersOnMouseClick()
{
    var ignoreClick = false;
    if (isMSIE())
    {
        //should recognize left and middle mouse clicks to filter new tab opening
        document.body.onmousedown = function()
            {
                var IE_MIDDLE_BITTON_CODE = 4;
                var e = window.event;
                if (e != undefined)
                    ignoreClick = (e.button >= IE_MIDDLE_BITTON_CODE);
            };
    }

    var currentHandler = document.body.onclick;
    document.body.onclick = function(e)
        {
            if (currentHandler)
                currentHandler(e);

            changeableHandler(e);

            if (!ignoreClick)
            {
                ignoreClick = false;
                exitHandler(e);
            }
        };
}

function checkModified()
{
    return (exitModifiedCallback != undefined) ? exitModifiedCallback() : changesDetected();
}

/* returns true if changes in the registered control were detected, or method handleChange() was executed. */
function changesDetected() {
    return formModified;
}

function setRedirectUrl(redirectUrl)
{
    if(document.forms[0].redirectUrl)
    {
        document.forms[0].redirectUrl.value = redirectUrl;
    }
}

function getRedirectUrl()
{
    if(document.forms[0].redirectUrl)
        return document.forms[0].redirectUrl.value
    else
        return window.location.href;
}

function setValidateFunction(valFunc)
{
    if(valFunc != undefined)
        validateFunction = valFunc;
}


function ConfirmExitDlg(width, warningText, questText, saveButtonCaption, discardButtonCaption, remainButtonCaption)
{
    this.width = width;
    this.warningText = warningText;
    this.questText = questText;
    this.confirmDlg = document.getElementById("exitConfirmDiv");
    this.saveButton      = document.getElementById("SaveChangesButton");
    this.discardButton   = document.getElementById("DiscardChangesButton");
    this.remainButton    = document.getElementById("RemainOnThePageButton");

    this.setupButton(this.saveButton, saveButtonCaption);
    this.setupButton(this.discardButton, discardButtonCaption);
    this.setupButton(this.remainButton, remainButtonCaption);
    if(saveButtonCaption != "")
    {
        this.buttonToFocus = this.saveButton;
    }
    else
    {
        this.buttonToFocus = this.discardButton;
    }

    var warning = document.getElementById("ConfirmWarning");
    warning.firstChild.nodeValue = warningText;
    var quest   = document.getElementById("ConfirmQuest");
    quest.firstChild.nodeValue = questText;
}

/** use this to set warning message of several */         
ConfirmExitDlg.prototype.setWarningInnerHTML = function (value) {
    document.getElementById("ConfirmWarning").innerHTML = value;
};

ConfirmExitDlg.prototype.positionDlg =
function ConfirmExitDlg_positionDlg() {
    this.confirmDlg.style.width = this.width + "px";

    var ps = getClientSize();
    var scrollXFactor = ps[0] - getInsideWindowWidth();
    var scrollYFactor = ps[1] - getInsideWindowHeight();
    shiftTo(this.confirmDlg, (scrollXFactor + (ps[0] - scrollXFactor) / 2) - this.width / 2,
                             (scrollYFactor + (ps[1] - scrollYFactor) / 2) - parseInt(this.confirmDlg.style.height, 10) / 2) ;
}

ConfirmExitDlg.prototype.setupButton =
function ConfirmExitDlg_setupButton(button, caption) {
    if(button)
    {
        if(caption != undefined && caption != "")
        {
            button.value = caption;
        }
        else
        {
            hideElement(button);
        }
    }
}

ConfirmExitDlg.prototype.open =
function ConfirmExitDlg_open() {
    showMoire("moireDiv", "container", "moireIframe");
    this.positionDlg();
    showElement(this.confirmDlg);
    var temp = this;
    window.setTimeout(function () { try {temp.buttonToFocus.focus();} catch(e){}; }, 200);
}

ConfirmExitDlg.prototype.close =
function ConfirmExitDlg_close() {
    hideElement(this.confirmDlg);
    hideMoire("moireDiv", "moireIframe");
}
