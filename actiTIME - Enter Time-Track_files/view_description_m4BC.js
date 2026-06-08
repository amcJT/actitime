/**
 * Required files: rpc_retry_controller.js
 */

var timeout = 10000;
var jsonrpc;
var descriptionsCache = new Array();
var descriptionPopup = new StaticTextDhtmlPopup('descriptionPopup');
var descriptionState;

function ViewDescriptionMessages() {}

function ViewDescriptionState(objectId, cell, image, descriptionUtil) {
    this.objectId = objectId;
    this.cell = cell;
    this.image = image;
    this.state = 'LOADING'; // VIEW, LOADING
    this.descriptionUtil = descriptionUtil;
    this.requestId = null;

    this.updatePopupState();
}

ViewDescriptionState.prototype.setState =
function ViewDescriptionState_setState(state) {
    this.state = state;
    this.updatePopupState();
}

ViewDescriptionState.prototype.updatePopupState =
function ViewDescriptionState_updatePopupState() {
    if (this.state == 'VIEW')
        this.turnPopupToViewState();
    else if (this.state == 'LOADING')
        this.turnPopupToLoadingState();
}


ViewDescriptionState.prototype.turnPopupToViewState =
function ViewDescriptionState_turnPopupToViewState() {
    document.getElementById('closeDescriptionPopupActiveSpan').style.display = 'block';
    document.getElementById('closeDescriptionPopupDisabledSpan').style.display = 'none';
}

ViewDescriptionState.prototype.turnPopupToLoadingState =
function ViewDescriptionState_turnPopupToLoadingState() {
    document.getElementById('closeDescriptionPopupActiveSpan').style.display = 'none';
    document.getElementById('closeDescriptionPopupDisabledSpan').style.display = 'block';
}

/* Displays description popup with default offset (-100, +25).*/
function showDescriptionWithDefaultOffset(objectId, link, descriptionUtil, cell) {
    showDescriptionWithOffset(objectId, link, descriptionUtil, cell, -100, +25);
}

/*
 * Displays description popup for object with objectId id (what is entity type of is determined by descriptionUtil, it can
 * be 'Task', 'Project', 'Customer').
 *
 * link - a link that initiated this function calling.
 * descriptionUtil is an object that keeps information about entity that message is displaying for
 *                 (e.g. if the description is for a task, descriptionUtil will looks like this: new DescriptionUtil(TASK_ENTITY))
 *                 (See description_util.js/DescriptionUtil).
 * cell is a table cell that will be highlighted when link to show the description will be clicked. It can be null then
        the cell is cell where the link is placed.
 * offsetX is the quantity (in pixels) that determine the description popup X-direction offset. It is positive to move popup to the
 * right and negative to move to the left.
 * offsetY is the quantity (in pixels) that determine the description popup Y-direction offset. It is positive to move popup down
 * and negative to move up.
*/
function showDescriptionWithOffset(objectId, link, descriptionUtil, cell, offsetX, offsetY) {
    if (isBusyState()) return;

    descriptionPopup.hide();

    if(cell == undefined || cell == null)
        cell = link.parentNode;
    var image = link.childNodes[0];

    descriptionPopup.setAfterShowHandler(
        function() {
            if (cell) cell.style.backgroundColor = DHTMLColors.onClickHighlightColor;
        }
    );
    descriptionPopup.setAfterHideHandler(
        function() {
            if (cell) cell.style.backgroundColor = '';
        }
    );
    descriptionPopup.setBeforeHideHandler(
        function() {
            if (isBusyState()) return false;

            return true;
        }
    );

    descriptionState = new ViewDescriptionState(objectId, cell, image, descriptionUtil);
    // Get description for the entity with specified id
    var description = getDescription(descriptionUtil.entityType, objectId);
    if (description == null) {
        descriptionState.setState('LOADING');
        descriptionPopup.show(descriptionUtil.VIEW_DESCRIPTION_POPUP_CAPTION, 'Loading ...', offsetX, offsetY);
        loadDescription(objectId, descriptionUtil);
    } else {
        descriptionState.setState('VIEW');
        descriptionPopup.show(descriptionUtil.VIEW_DESCRIPTION_POPUP_CAPTION, description, offsetX, offsetY);
    }
}

function getDescription(entityType, objectId) {
    // Entity type + object id (different entity types may be stored in cache) uniquely identifies entry in cache
    return descriptionsCache[entityType + objectId];
}

function cacheDescription(entityType, objectId, description) {

    /*
        In order to identify object its type together with id should be used. Since cache may hold
        descriptions for various entities and two entities of different types may have same object id
        (ex: on "archived_customers_projects" page customers and projects, see bug #20274)
    */
    descriptionsCache[entityType + objectId] = description;
}

function loadDescription(objectId, descriptionUtil) {
    descriptionState.retryController = new RpcRetryController( timeout,
        function() {
            descriptionUtil.doLoadDescription(
                objectId, descriptionLoaded,
                function( error ) {
                    if( descriptionState ) descriptionState.retryController.handleErrorOrRetry( error );
                },
                function (reqId) {
                    if (descriptionState) descriptionState.requestId = reqId;
                });
        },
        descriptionLoadingTimeout, processDescriptionError
        );
     descriptionState.retryController.start();
}

function descriptionLoaded(result, error) {
    if (!isBusyState()) return;

    if (descriptionState.tid)
        window.clearTimeout(descriptionState.tid);

    if (error != null) {
        descriptionState.retryController.handleErrorOrRetry(error);
        return;
    }

    var description = result;
    var descriptionUtil = descriptionState.descriptionUtil;
    // Save description in cache
    cacheDescription(descriptionUtil.entityType, descriptionState.objectId, description)
    descriptionState.setState('VIEW');
    descriptionPopup.update(descriptionUtil.VIEW_DESCRIPTION_POPUP_CAPTION, description);
}

function isBusyState() {
    return descriptionState != null && descriptionState.state == 'LOADING';
}

function processDescriptionError(exception) {
    if (exception.name.indexOf('com.actimind.actitime.services.NoRightsForRemoteCallException') != -1) {
        if ((typeof noRightsURL != typeof undefined) && noRightsURL)
            document.location.href = noRightsURL;
        else
            document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.task.NoSuchTaskException') != -1) {
        alert(ViewDescriptionMessages.ERR_TASK_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.project.NoSuchProjectException') != -1) {
        alert(ViewDescriptionMessages.ERR_PROJECT_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (exception.name.indexOf('com.actimind.actitime.customer.NoSuchCustomerException') != -1) {
        alert(ViewDescriptionMessages.ERR_CUSTOMER_WAS_DELETED);
        document.location.reload();
        return;
    }

    if (descriptionState.state == 'LOADING')
        alert(descriptionState.descriptionUtil.Messages.ERROR_DESCRIPTION_LOADING);
    else
        alert(descriptionState.descriptionUtil.Messages.ERROR_DESCRIPTION_SAVING);

    descriptionCleanup();
}

function descriptionCleanup() {
    if (descriptionState) {
        descriptionState.retryController.stop();

        descriptionState = null;
        descriptionPopup.hide();
    }
}

function descriptionLoadingTimeout() {
    if (isBusyState()) {
        var msg = descriptionState.descriptionUtil.Messages.TIMEOUT_DESCRIPTION_LOADING;

        if (!confirm(msg)) {
            if (isBusyState()) {
                if (descriptionState && descriptionState.requestId) {
                    JSONRpcClient.cancelRequest(descriptionState.requestId);
                }

                jsonrpc.abortAllRequests();
                descriptionCleanup();
            }
        } else {
            if (isBusyState())
                if( descriptionState )
                {
                    descriptionState.retryController.stop();
                    descriptionState.retryController.start();
                }
        }
    }
}
