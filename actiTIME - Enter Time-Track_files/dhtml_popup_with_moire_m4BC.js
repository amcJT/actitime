/*
 * Id of HTML DOM object representing moire DIV.
 */
DHTMLPopupWithMoire.prototype.moireDivId = "moireDiv";
/*
 * Id of HTML DOM object representing moire IFRAME.
 */
DHTMLPopupWithMoire.prototype.moireIframeId = "moireIframe";
/*
 * Id of HTML DOM object keeping HTML of the whole page. It is needed to block all page elements by placing in it moire.
 */
DHTMLPopupWithMoire.prototype.documentContainerId = "container";

/*
 * DHTMLPopupWithMoire is intended for showing pop-ups with moire.
 */
function DHTMLPopupWithMoire(popupId) {
    /*
     * Property to keep document keydown handler before popup showing.
     */
    this.previousDocumentKeydownHandler = document.onkeydown;
    /*
     * Property to keep window resizing handler before popup showing.
     */
    this.previousWindowResizeHandler = window.onresize;
    /*
     * Property to keep moire DIV mouse down handler before popup showing.
     */
    this.previousMoireDivMouseDownHandler = null;
    /*
     * Property to keep moire IFRAME mouse down handler before popup showing.
     */
    this.previousMoireIframeMouseDownHandler = null;
    /*
     * Id of HTML DOM object keeping popup HTML-code.
     */
    this.popupId = popupId;

    /*
     * Shows the pop-up. Pop-up showing is accompanied by moire showing which blocks all page elements except the
     * pop-up.
     */
    this.show = function () {
        showMoire(DHTMLPopupWithMoire.prototype.moireDivId,
                  DHTMLPopupWithMoire.prototype.documentContainerId,
                  DHTMLPopupWithMoire.prototype.moireIframeId);
        showElement(document.getElementById(this.popupId));
        this.centrePopup();
        this.focusPopup(); // focusing pop-up to get out focus from underlying content

        this.previousDocumentKeydownHandler = document.onkeydown;
        this.setupKeyDownHandler();

        this.previousWindowResizeHandler = window.onresize;
        this.setupWindowResizeHandler();

        this.previousMoireDivMouseDownHandler = this.getMoireDiv().onmousedown;
        this.previousMoireIframeMouseDownHandler = this.getMoireIframe().onmousedown;
        this.setupMouseDownHandler();
    };

    /*
     * Hides popup. Special moire is hided too.
     */
    this.hide = function () {
        hideElement(document.getElementById(this.popupId));
        hideMoire(DHTMLPopupWithMoire.prototype.moireDivId,
                  DHTMLPopupWithMoire.prototype.moireIframeId);

        document.onkeydown = this.previousDocumentKeydownHandler;
        window.onresize = this.previousWindowResizeHandler;

        this.getMoireDiv().onmousedown = this.previousMoireDivMouseDownHandler;
        this.getMoireIframe().onmousedown = this.previousMoireIframeMouseDownHandler;
    };

    /*
     * Centres the pop-up on the screen.
     */
    this.centrePopup = function () {
        var popup = document.getElementById(this.popupId);

        var screenDimensions = getClientSize();
        var scrollXFactor = screenDimensions[0] - getInsideWindowWidth();
        var scrollYFactor = screenDimensions[1] - getInsideWindowHeight();

        shiftTo(popup,
                (scrollXFactor + (screenDimensions[0] - scrollXFactor) / 2) - popup.offsetWidth / 2,
                (scrollYFactor + (screenDimensions[1] - scrollYFactor) / 2) - parseInt(popup.offsetHeight, 10) / 2);
    };

    /*
     * Focuses pop-up to get out focus from underlying content.
     */
    this.focusPopup = function () {
        var popup = document.getElementById(this.popupId);
        var firstPopupTd = popup.getElementsByTagName("td")[0];

        // workaround special for opera. In opera we can't focus on td - it isn't work
        // and cannot focus on link with www.actimind.com because it will be selected.
        if(navigator.userAgent.toLowerCase().indexOf('opera') != -1){
            var focusLink = document.getElementById("focusLink");
            if(focusLink.focus)
                focusLink.focus();
        }
        if (firstPopupTd.focus) { // For all browser except Netscape
            firstPopupTd.focus();
        } else { // For Netscape
            var firstPopupLink = popup.getElementsByTagName("a")[0];
            firstPopupLink.focus();
        }
    };

    this.getMoireDiv = function()
    {
        return document.getElementById(DHTMLPopupWithMoire.prototype.moireDivId);
    };

    this.getMoireIframe = function()
    {
        return document.getElementById(DHTMLPopupWithMoire.prototype.moireIframeId);
    };

    this.setupKeyDownHandler = function()
    {
        var thisPopup = this; // dereferencing of THIS object to use it asynchronously in various handlers
        document.onkeydown = function(evt) {
            if(thisPopup.hideOnEscape())
                handleEscape(function() {thisPopup.hide();}, evt);
            handleTab(function() {thisPopup.focusPopup();}, evt);
        };
    };

    this.setupWindowResizeHandler = function()
    {
        var thisPopup = this; // dereferencing of THIS object to use it asynchronously in various handlers

        window.onresize = function()
        {
            if( thisPopup.hideOnResize() )
            {
                thisPopup.hide();
            }
            else
            {
                refreshMoireAfterResizing(DHTMLPopupWithMoire.prototype.moireDivId,
                                          DHTMLPopupWithMoire.prototype.documentContainerId,
                                          DHTMLPopupWithMoire.prototype.moireIframeId);
                thisPopup.centrePopup();
            }
        };
    };

    this.hideOnResize = function()
    {
        return true;
    };

    this.hideOnEscape = function()
    {
        return true;
    };

    this.setupMouseDownHandler = function()
    {
        var thisPopup = this; // dereferencing of THIS object to use it asynchronously in various handlers

        this.getMoireDiv().onmousedown =
          this.getMoireIframe().onmousedown = function()
          {
              if( thisPopup.hideOnMouseDown() )
                  thisPopup.hide();
          };
    };

    this.hideOnMouseDown = function()
    {
        return true;
    };
}