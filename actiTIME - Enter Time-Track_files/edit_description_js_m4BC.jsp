
var timeout = 10000;
var jsonrpc;
var editDescriptionPopup = new EditableTextDhtmlPopup('editDescriptionPopup');
editDescriptionPopup.setApplyBeyondScreenDisplayFix( true );
var editDescriptionState;

function EditDescriptionMessages() {}

/*
   Class EditDescriptionState.
     used for storing and manipulating DHTML-window state.
   Methods:
     - constructor : create an EditDescriptionState object using given parameter,
       set current state to "EDITING" and make DHTML-window ready for edit description.
     - isDescriptionModified : defines if description was changed by user.
     - setState : update popup view to the given state
     - updateImage : change DHTML-window link icon depending on presence or absence description of
       current entity.

*/

/*
  Constructor.
    create an EditDescriptionState object using given parameter, set current state to "EDITING"
    and make DHTML-window ready for edit description.
  Parameters:
    - objectId : id of editing entity
    - cell : cell with DHTML-window link
    - image : DHTML-window link icon
    - descriptionUtil : utils for loading / saving description
    - updateState : defines if DHTML-window state should be updated in Constructor call.
*/
function EditDescriptionState(objectId, cell, image, descriptionUtil, updateState, commentEnteredImg, commentBlankImg) {
    this.objectId = objectId;
    this.cell = cell;
    this.image = image;
    this.state = 'EDITING'; // SAVING, LOADING
    this.originalDescription = '';
    this.descriptionUtil = descriptionUtil;
    if(descriptionUtil != null)
        this.textLengthNote = new TextAreaLengthNote('descLength', descriptionUtil.Messages.TEXT_AREA_NOTE_NAME, 2000);
    if(updateState == undefined || updateState == true)
        this.updatePopupState();
    this.commentEnteredImg = commentEnteredImg;
    if(commentEnteredImg == undefined || commentEnteredImg == null)
        this.commentEnteredImg = '/img/default/dialogs/comments/comment_entered.gif?hash=797059755';
    this.commentBlankImg = commentBlankImg;
    if(commentBlankImg == undefined || commentBlankImg == null)
        this.commentBlankImg = '/img/default/dialogs/comments/comment_blank.gif?hash=797059755';
    this.requestId = null;
}

/*
    Defines if description was changed by user.
    Old and new descriptions compares ignoring spaces before and after text.
*/
EditDescriptionState.prototype.isDescriptionModified =
function EditDescriptionState_isDescriptionModified() {
    var oldDescription = toUnixLineFeeds(trim(this.originalDescription));
    var newDescription = toUnixLineFeeds(trim(editDescriptionPopup.getPopupTextValue()));
    return oldDescription != newDescription;
}

/*
    Update popup view to the given state
*/
EditDescriptionState.prototype.setState =
function EditDescriptionState_setState(state) {
    this.state = state;
    this.updatePopupState();
}

/*
    Change DHTML-window link icon depending on presence or absence description of
    current entity.
*/
EditDescriptionState.prototype.updateImage =
function EditDescriptionState_updateImage() {
    editDescriptionState.image.src = editDescriptionPopup.isEmpty() ? this.commentBlankImg : this.commentEnteredImg;
}

EditDescriptionState.prototype.updatePopupState =
function EditDescriptionState_updatePopupState() {
    if (this.state == 'EDITING') {
        this.turnPopupToEditingState();
    } else if (this.state == 'LOADING') {
        this.turnPopupToLoadingState();
    } else if (this.state == 'SAVING') {
        if( this.cell != null )
            this.cell.style.backgroundColor = DHTMLColors.beingSavedColor;
        this.turnPopupToSavingState();
    }
}

EditDescriptionState.prototype.turnPopupToEditingState =
function EditDescriptionState_turnPopupToEditingState() {
    document.getElementById('editDescriptionPopupEditingState').style.display = 'block';
    document.getElementById('editDescriptionPopupSavingState').style.display = 'none';
    document.getElementById('editDescriptionPopupLoadingState').style.display = 'none';
    document.getElementById('editDescriptionPopupButtons').style.display = 'block';
    document.getElementById('closeEditDescriptionPopupDisabledSpan').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupActiveSpan').style.display = 'block';
    this.textLengthNote.show();
}

EditDescriptionState.prototype.turnPopupToSavingState =
function EditDescriptionState_turnPopupToSavingState() {
    document.getElementById('editDescriptionPopupEditingState').style.display = 'none';
    document.getElementById('editDescriptionPopupSavingState').style.display = 'block';
    document.getElementById('editDescriptionPopupLoadingState').style.display = 'none';
    document.getElementById('editDescriptionPopupButtons').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupActiveSpan').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupDisabledSpan').style.display = 'block';
    this.textLengthNote.hide();
}

EditDescriptionState.prototype.turnPopupToLoadingState =
function EditDescriptionState_turnPopupToLoadingState() {
    document.getElementById('editDescriptionPopupEditingState').style.display = 'none';
    document.getElementById('editDescriptionPopupSavingState').style.display = 'none';
    document.getElementById('editDescriptionPopupLoadingState').style.display = 'block';
    document.getElementById('editDescriptionPopupButtons').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupActiveSpan').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupDisabledSpan').style.display = 'block';
    this.textLengthNote.hide();
}

EditDescriptionState.prototype.turnPopupToHideState =
function EditDescriptionState_turnPopupToLoadingState() {
    document.getElementById('editDescriptionPopupEditingState').style.display = 'none';
    document.getElementById('editDescriptionPopupSavingState').style.display = 'none';
    document.getElementById('editDescriptionPopupLoadingState').style.display = 'none';
    document.getElementById('editDescriptionPopupButtons').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupActiveSpan').style.display = 'none';
    document.getElementById('closeEditDescriptionPopupDisabledSpan').style.display = 'none';
    this.textLengthNote.hide();
}

EditDescriptionState.prototype.setRequestId = function(id) {
    // do not overwrite ID field with null or undefined values, 
    // as this means that previous request has not been processed or canceled yet
    if (id) {
        this.requestId = id;
    }
};

EditDescriptionState.prototype.getRequestId = function() {
    return this.requestId;
};

function setPopupHandlers(cell, descriptionUtil){
    editDescriptionPopup.setAfterShowHandler(
        function() {
            if (cell) cell.style.backgroundColor = DHTMLColors.onClickHighlightColor;
        }
    );
    editDescriptionPopup.setAfterHideHandler(
        function() {
            if (cell) cell.style.backgroundColor = '';
            editDescriptionState = null;
        }
    );
    editDescriptionPopup.setBeforeHideHandler(
        function() {
            if (isBusySavingState()) return false;
            if (editDescriptionState && editDescriptionState.isDescriptionModified()){
                // please do not replace the following two lines with "return confirm ..."
                // such functionality is needed to get rid of grey buttons
                // which appear on the screen during dhtml popup loading
                if(!confirm(descriptionUtil.Messages.MODIFICATIONS_NOT_SAVED))
                    return false;
            }

            if(editDescriptionState)
                editDescriptionState.turnPopupToHideState();
            return true;
        }
    );

}

// shows the edit description popup with the default offset (-100, +25)
function showSavingDescriptionWithDefaultOffset(objectId, link, descriptionUtil, cell, isLoadFromPage, commentEnteredImg, commentBlankImg)
{
    showSavingDescriptionWithOffset(objectId, link, descriptionUtil, cell, isLoadFromPage, -100, +25, commentEnteredImg, commentBlankImg);
}

// shows the edit description popup with the specified offset
function showSavingDescriptionWithOffset(objectId, link, descriptionUtil, cell, isLoadFromPage, offsetX, offsetY, commentEnteredImg, commentBlankImg) {
    if (isBusySavingState()) return;

    if(cell == undefined || cell == null)
        cell = link.parentNode;
    var image = link.childNodes[0];

    setPopupHandlers(cell, descriptionUtil);

    editDescriptionState = new EditDescriptionState(objectId, cell, image, descriptionUtil, null, commentEnteredImg, commentBlankImg);

    var needLoading = true;

    if(isLoadFromPage != undefined && isLoadFromPage == true){
        var onPageDescription = getOnPageDescription(objectId);

        editDescriptionState.textLengthNote.update(onPageDescription);
        editDescriptionState.originalDescription = onPageDescription;
        editDescriptionPopup.show(descriptionUtil.EDIT_DESCRIPTION_POPUP_CAPTION, onPageDescription, offsetX, offsetY);
        return;
    }

    editDescriptionState.setState('LOADING');
    editDescriptionPopup.show(descriptionUtil.EDIT_DESCRIPTION_POPUP_CAPTION, '', offsetX, offsetY);
    loadSavingDescription(objectId, descriptionUtil);
}

function loadSavingDescription(objectId, descriptionUtil) {
    editDescriptionState.retryController = new RpcRetryController( timeout,
        function()
        {
            if( !editDescriptionState ) return;
            descriptionUtil.doLoadDescription(
                objectId, savingDescriptionLoaded,
                function( error )
                {
                    editDescriptionState.retryController.handleErrorOrRetry( error );
                },
                function ( reqId )
                {
                    if( editDescriptionState ) editDescriptionState.setRequestId( reqId );
                } );
        },
        savingDescriptionLoadingTimeout, processSavingDescriptionError );
    editDescriptionState.retryController.start();
}

function savingDescriptionLoaded(result, error) {
    if (!isBusySavingState()) return;

    if (error != null) {
        editDescriptionState.retryController.handleErrorOrRetry( error );
        return;
    }

    if (editDescriptionState.retryController)
        editDescriptionState.retryController.stop();

    var description = result;
    editDescriptionState.originalDescription = description;
    editDescriptionState.setState('EDITING');
    editDescriptionPopup.update(editDescriptionState.descriptionUtil.EDIT_DESCRIPTION_POPUP_CAPTION, description);
    editDescriptionState.textLengthNote.update(description);
}

function isBusySavingState() {
    return editDescriptionState != null && editDescriptionState.state != 'EDITING';
}


function isCorrectDescriptionLength(descriptionUtil){
    var description = trim(editDescriptionPopup.getPopupTextValue());
    var descriptionLength = getStringWithUnifiedNewLineSymbol(description).length;
    
    editDescriptionPopup.getPopupTextObject().value = description;
    if (descriptionLength > 2000) {
        alert(descriptionUtil.Messages.TOO_LONG_DESCRIPTION(descriptionLength));
        return false;
    }
    return true;
}

/*
    Save description.
    In this case there not shown "Saving..." and "Loading..." words
    and not highlighted "just saved" cell.
*/
function saveOnPageDescription(){
    if (isBusySavingState()) return true;
    if (editDescriptionState == undefined) return true;

    var descriptionUtil = editDescriptionState.descriptionUtil;
    if(!isCorrectDescriptionLength(descriptionUtil))
        return false;
    editDescriptionState.state = 'SAVING';
    descriptionUtil.doSaveDescription(editDescriptionState.objectId, editDescriptionPopup.getPopupTextValue(),
                                      function(result, error) {
                                          descriptionSaved(result, error, true);
                                      }, null,
                                      function(reqId) {
                                          if (editDescriptionState) editDescriptionState.setRequestId(reqId);
                                      });

    return true;
}

/*
    Save description.
    In this case there are shown "Saving..." and "Loading..." words
    and "just saved" cell highlighted some time after popup closed.
*/
function saveDescription(afterSaveHandler) {
    if (isBusySavingState()) return;

    var descriptionUtil = editDescriptionState.descriptionUtil;

    if(!isCorrectDescriptionLength(descriptionUtil))
        return;

    editDescriptionState.setState('SAVING');

    editDescriptionState.retryController = new RpcRetryController( timeout,
        function() {
            if( !editDescriptionState ) return;

            descriptionUtil.doSaveDescription(editDescriptionState.objectId, editDescriptionPopup.getPopupTextValue(),
                                    function(result, error) {
                                        if (descriptionSaved(result, error, false) && afterSaveHandler)
                                            afterSaveHandler();
                                    },
                                    function( error )
                                    {
                                        editDescriptionState.retryController.handleErrorOrRetry( error );
                                    },
                                    function(reqId) {
                                          if (editDescriptionState) editDescriptionState.setRequestId(reqId);
                                    });
        },
        descriptionSavingTimeout, processSavingDescriptionError);

    editDescriptionState.retryController.start();    
}

function descriptionSaved(result, error, immediate) {
    if (!isBusySavingState()) return false;

    if (error != null && editDescriptionState.retryController) {
        editDescriptionState.retryController.handleErrorOrRetry( error );
        return false;
    }

    editDescriptionState.updateImage();
    if(immediate == undefined)
        immediate = false;
    descriptionSavingCleanup(immediate);

    return true;
}

function processSavingDescriptionError(exception) {
    if (editDescriptionState)
        editDescriptionState.retryController.stop();

    if (exception.name.indexOf('com.actimind.actitime.services.NoRightsForRemoteCallException') != -1) {
        if (noRightsURL)
            document.location.href = noRightsURL;
        else
            document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.task.NoSuchTaskException') != -1) {
        alert(EditDescriptionMessages.ERR_TASK_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.project.NoSuchProjectException') != -1) {
        alert(EditDescriptionMessages.ERR_PROJECT_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.customer.NoSuchCustomerException') != -1) {
        alert(EditDescriptionMessages.ERR_CUSTOMER_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (editDescriptionState.state == 'LOADING')
        alert(editDescriptionState.descriptionUtil.Messages.ERROR_DESCRIPTION_LOADING);
    else
        alert(editDescriptionState.descriptionUtil.Messages.ERROR_DESCRIPTION_SAVING);

    descriptionSavingCleanup(true);

}

function descriptionSavingCleanup(immediate) {
    if (editDescriptionState) {
        if (editDescriptionState.retryController)
            editDescriptionState.retryController.stop();

        if (editDescriptionState.descriptionUtil.loadTimerId)
            window.clearTimeout(editDescriptionState.descriptionUtil.loadTimerId);

        if (typeof editDescriptionState.descriptionUtil.tid != typeof undefined)
            window.clearTimeout(editDescriptionState.descriptionUtil.tid);

        editDescriptionPopup.setAfterHideHandler(null);

        var cell = editDescriptionState.cell;
        var removeCellHighlightingFunc = function() {
            if ((!editDescriptionState || editDescriptionState.cell != cell) && cell != null)
                cell.style.backgroundColor = '';
        }

        editDescriptionState = null;
        editDescriptionPopup.hide();

        if (immediate)
            removeCellHighlightingFunc()
        else
            window.setTimeout(removeCellHighlightingFunc, 1000);
    }
}

function descriptionSavingTimeout() {
    descriptionSavingLoadingTimeout(editDescriptionState.descriptionUtil.Messages.TIMEOUT_DESCRIPTION_SAVING);
}

function savingDescriptionLoadingTimeout() {
    descriptionSavingLoadingTimeout(editDescriptionState.descriptionUtil.Messages.TIMEOUT_DESCRIPTION_LOADING);
}

function descriptionSavingLoadingTimeout(message) {
    if (isBusySavingState()) {
        var msg = message;

        if (!confirm(msg)) {
            if (isBusySavingState()) {
                if (editDescriptionState && editDescriptionState.getRequestId()) {
                    JSONRpcClient.cancelRequest(editDescriptionState.getRequestId());
                }

                jsonrpc.abortAllRequests();
                descriptionSavingCleanup(true);
            }
        } else {
            if( !editDescriptionState || !editDescriptionState.retryController ) return;

            editDescriptionState.retryController.stop();
            if (isBusySavingState())
                editDescriptionState.retryController.start();
        }
    }
}