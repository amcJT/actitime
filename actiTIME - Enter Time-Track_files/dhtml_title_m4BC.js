
function DhtmlTitle(divId, disableTagFilter, disableMouseEvents) {
    this.divId = divId;
    this.delayedTid = null;
    this.disableTagFilter = disableTagFilter;
    this.disableMouseEvents = disableMouseEvents;
}

DhtmlTitle.prototype.getDiv = function () {
    return document.getElementById(this.divId);
}

DhtmlTitle.prototype.show = function (titleText, srcObject, offsetX, offsetY) {
    var x = offsetX;
    var y = offsetY;
    if( srcObject )
    {
        var coords = calculateObjectCoords(srcObject);
        x += coords.x;
        y += coords.y;
    }
    this.showAtPosition(titleText, srcObject, x, y);
}

//private
DhtmlTitle.prototype.showAtPosition = function(titleText, srcObject, x, y)
{
    this.cancelDelayedShow();

    var div = this.getDiv();
    if( !this.disableTagFilter )
        titleText = titleText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
    div.innerHTML = titleText;

    div.style.display = 'block';
    this.shiftTo( x, y );

    var title = this;
    var objectMouseoverFunc;

    if (srcObject)
        objectMouseoverFunc = srcObject.onmouseover;

    var mouseoutFunc = function() {
        title.hide();
        title.restoreMouseover(srcObject, objectMouseoverFunc);
    }

    var mouseoverFunc = function() {
        title.cancelHide();
        title.restoreMouseover(srcObject, objectMouseoverFunc);
    }

    if (srcObject) {
        srcObject.onmouseout = mouseoutFunc;
        srcObject.onmouseover = mouseoverFunc;
    }

    if (!this.disableMouseEvents) {
        div.onmouseout = mouseoutFunc;
        div.onmouseover = mouseoverFunc;
    }
}

DhtmlTitle.prototype.showNearMouse = function (titleText, srcObject, mouse) {
    this.showAtPosition(titleText, srcObject, mouse.getX(), mouse.getY() + mouse.getCursorHeight());
}

DhtmlTitle.prototype.shiftTo = function( x, y )
{
    // if popup's right edge is beyond the window edge, move it to the left
    var width = getObjectWidth( this.getDiv().id );
    var verticalScrollWidth = isMSIE()? 0 : 16;
    var oversize = x + width - document.body.scrollLeft - getInsideWindowWidth() + verticalScrollWidth;
    if (oversize > 0)
    {
        x -= oversize;
    }

    shiftTo( this.getDiv(), x, y );
};

DhtmlTitle.prototype.restoreMouseover = function(object, func) {
    if (!object) return;
    object.onmouseover = func;
}

DhtmlTitle.prototype.showDelayed = function (titleText, srcObject, offsetX, offsetY) {
    this.showDelayedWithTimeout(titleText, srcObject, offsetX, offsetY, 1000);
};

DhtmlTitle.prototype.showDelayedWithTimeout = function (titleText, srcObject, offsetX, offsetY, timeout)
{
    this.cancelDelayedShow();
    var obj = this;
    this.delayedTid = window.setTimeout(function() { obj.show(titleText, srcObject, offsetX, offsetY); }, timeout);
};

DhtmlTitle.prototype.showDelayedWithTimeoutNearMouse = function (titleText, srcObject, mouse, timeout)
{
    this.cancelDelayedShow();
    var obj = this;
    this.delayedTid = window.setTimeout(function() { obj.showNearMouse(titleText, srcObject, mouse); }, timeout);
};


DhtmlTitle.prototype.cancelDelayedShow = function() {
    if (this.delayedTid) {
        window.clearTimeout(this.delayedTid);
        this.delayedTid = null;
    }
}

DhtmlTitle.prototype.hide = function () {
    var title = this;
    this.cancelDelayedShow();
    this.tid = window.setTimeout(function() { title.immediateHide(); }, 500);
}

DhtmlTitle.prototype.cancelHide = function () {
    if (this.tid) {
        window.clearTimeout(this.tid);
        this.tid = null;
    }
}

DhtmlTitle.prototype.immediateHide = function () {
    this.getDiv().style.display = 'none';
    if (document.setActive) document.setActive();
}

