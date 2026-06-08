/********************************************** BEGIN CLASS DECLARATION **********************************************/
/*********************************************** BEGIN CLASS PROPERTIES ***********************************************/
/*
 * Id of HTML DOM object representing moire DIV.
 */
Menu.prototype.menuMoireDivId = "menuMoireDiv";
/*
 * Id of HTML DOM object representing moire IFRAME.
 */
Menu.prototype.menuMoireIframeId = "menuMoireIframe";
/*
 * Id of HTML DOM object keeping HTML of the whole page. It is needed to block all page elements by placing in it moire.
 */
Menu.prototype.documentContainerId = "container";
/************************************************ END CLASS PROPERTIES ************************************************/

/*
 * Menu is intended for menu showing and hiding.
 */
function Menu(menuId) {
/*********************************************** BEGIN FIELDS ***********************************************/
    /*
     * Id of HTML DOM object keeping menu HTML-code.
     */
    this.menuId = menuId;
    /*
     * Property to keep document click handler before menu showing.
     */
    this.previousDocumentOnclickHandler = document.onclick;
    /*
     * Property to keep window resizing handler before menu showing.
     */
    this.previousWindowResizeHandler = window.onresize;
/*********************************************** END FIELDS ***********************************************/

/*********************************************** BEGIN PUBLIC METHODS ***********************************************/    
    /*
     * Shows menu if it is hided and hides it otherwise.
     */
    this.switchDisplayStatus = function(evt, allMenus) {
        if (!this.isShown()) {
            if (document.currentShownTopMenu)
            {
                document.currentShownTopMenu.hide();
            }
            document.currentShownTopMenu = this;
            this.show(evt);
        } else {
            this.hide();
        }
    }

    /*
     * Shows menu. Menu showing is accompanied by moire showing which blocks all page elements except the menu and
     * button for its showing.
     */
    this.show = function(evt) {
        var eventObj = getEventObj(evt);
        if (eventObj != null) { // preventing from menu showing in a not appropriate place if horizontal scrolling exists and event object is null (method was called when page is not loaded completely)
            var menu = document.getElementById(this.menuId);
            showElement(menu);
            //TODO:refactor this place 
            var menuCoordsObject = document.getElementById("help");
            if( menuCoordsObject ) {
                var menuCoords = calculateObjectCoords(menuCoordsObject);
                //var menuCoords = calculateCoords(eventObj);
                shiftTo(menu, menuCoords.x - 38, menuCoords.y + 71);
            }
            scrollWindowIfNeeded(menu, true);

            var thisMenu = this;
            var hideMenuFunc = function() {thisMenu.hide();};
            var handleClick = function(evt) {
                var target = evt ?
                                 evt.target :
                                 (event ?
                                      event.srcElement :
                                      null);
                if (target != document.getElementById(thisMenu.menuId)) {
                    hideMenuFunc();
                }
            };

            KeyDownHandler.setOnKeyDownHandler(
                    function(evt) {handleEscape(hideMenuFunc, evt);}
            );

            this.previousDocumentOnclickHandler = document.onclick;
            setTimeout(function() {document.onclick = function(evt) {handleClick(evt);};}, 1); // timeouting is needed to show menu on appropriate button click

            this.previousWindowResizeHandler = window.onresize;
            window.onresize = hideMenuFunc;

            if (isMSIE()) {
                this.underlayIframe();
            }
        }
    }

    /*
     * Hides menu. Special moire is hided too.
     */
    this.hide = function() {
        var menu = document.getElementById(this.menuId);
        var menuMoireIframe = document.getElementById(this.menuMoireIframeId);
        hideElement(menu);
        if (typeof menuMoireIframe != typeof undefined && menuMoireIframe != null) {
            hideElement(menuMoireIframe)
        }

        KeyDownHandler.restoreOnKeyDownHandler();
        document.onclick = this.previousDocumentOnclickHandler;
        window.onresize = this.previousWindowResizeHandler;
    }
/*********************************************** END PUBLIC METHODS ***********************************************/

/*********************************************** BEGIN PRIVATE METHODS ***********************************************/
    /*
     * Determines whether menu is shown or not.
     */
    this.isShown = function() {
        var menu = document.getElementById(this.menuId);

        return typeof menu != typeof undefined &&
               menu != null &&
               menu.style.display == "block";
    }

    /*
     * Underlays iframe under menu to show menu over selects control (for IE).
     */
    this.underlayIframe = function() {
        var menu = document.getElementById(this.menuId);
        var iframe = document.getElementById(this.menuMoireIframeId);

        if (menu.offsetWidth && typeof iframe != typeof undefined && iframe != null) { // iframe can be absence when page is not loaded completely
            iframe.style.width = menu.offsetWidth;
            iframe.style.height = menu.offsetHeight;
            iframe.style.top = menu.offsetTop;
            iframe.style.left = menu.offsetLeft;
            iframe.style.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';

            showElement(iframe);
        } else {
            this.hide();
        }
    }
/*********************************************** END PRIVATE METHODS ***********************************************/
}
/*********************************************** END CLASS DECLARATION ************************************************/