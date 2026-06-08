/*
 * Names of entites those are used for JSON requests.
 */
/*
  Class Messages.
    contains messages about save/load description status for the given entity.

  Methods:
    - contructor: Builds messages from templates using the given entity.

  Properties:
    All the properties are text messages built from templates.
    See the constructor implementation for more details.

  For detailed information about method parameters see the corresponding method description.
*/

/*
    Constructor.
      Builds messages from templates using the given parameters.
    Parameters:
      - entityType : an index from ENTITIES array to get string that is inserted into the message templates.
        Can be PROJECT_ENTITY, CUSTOMER_ENTITY, TASK_ENTITY and possibly other entities.
*/
function Messages(entityType){
    this.entityType = entityType;
    this.MODIFICATIONS_NOT_SAVED = messageResource.getMessage("description_util.modifications_not_saved", [ENTITIES[this.entityType].toLowerCase()]);
    this.TIMEOUT_DESCRIPTION_SAVING = messageResource.getMessage("description_util.timeout_description_saving", [ENTITIES[this.entityType].toLowerCase()]);
    this.TIMEOUT_DESCRIPTION_LOADING = messageResource.getMessage("description_util.timeout_description_loading", [ENTITIES[this.entityType].toLowerCase()]);
    this.ERROR_DESCRIPTION_SAVING = messageResource.getMessage("description_util.error_description_saving", [ENTITIES[this.entityType].toLowerCase()]);
    this.ERROR_DESCRIPTION_LOADING = messageResource.getMessage("description_util.error_description_loading", [ENTITIES[this.entityType].toLowerCase()]);
    this.TEXT_AREA_NOTE_NAME = messageResource.getMessage('description_util.text_area_note_name');
    this.TOO_LONG_DESCRIPTION = function(len) {
        return messageResource.getMessage("description_util.too_long_description", [ENTITIES[this.entityType], ENTITIES[this.entityType].toLowerCase(), ENTITIES[this.entityType].toLowerCase(), len]);
    };
}
/*
  Class DescriptionUtil
    used for loading and saving description about tasks, customer, projects and possibly
    other entities using jsonrpc.

  Methods:
    - contructor: Creates a DescriptionUtil object for the given entity type
    - checkServiceAvailable : Checks if jsonrpc is available
    - doLoadDescription : Loads description using jsonrpc
    - doSaveDescription : SAVEs description using jsonrpc

  Properties:
    - Messages: instance of class Messages. See the corresponding description for details.

  For detailed information about method parameters see the corresponding method description.
*/

/*
  Creates a DescriptionUtil object for the given entity type
  Parameters:
    - entityType : Uses for creation jsonrpc calls and different information messages.
      Can be PROJECT_ENTITY, CUSTOMER_ENTITY, TASK_ENTITY and possibly other entities.
*/
function DescriptionUtil(entityType) {
    this.entityType = entityType;
    this.EDIT_DESCRIPTION_POPUP_CAPTION = messageResource.getMessage('description_util.edit_description_popup_caption', [ENTITIES[this.entityType]]);
    this.VIEW_DESCRIPTION_POPUP_CAPTION = messageResource.getMessage('description_util.view_description_popup_caption', [ENTITIES[this.entityType]]);

    this.Messages = new Messages(entityType);

    this.loadTimerId = null; // timer id for loading process;
}

function createCheckRemoteServiceAvailableFunc(entityType)
{
  return new Function("", "return jsonrpc." + entityType + "InfoService;");
}

/*
    Check if jsonrpc is available, if not - reload the page.
*/
DescriptionUtil.prototype.checkServiceAvailable = function () {
    var checkRemoteServiceAvailable = createCheckRemoteServiceAvailableFunc(this.entityType);
    if (!checkRemoteServiceAvailable()) {
        /* service is unavailable, most likely we've been logged out */
        document.location.reload();
        return false;
    }

    return true;
}

function createGetDescriptionFunc(entityType){
    var method = getDescriptionMethod( entityType ) + "(descriptionLoadedHandler, id)";
    return new Function("descriptionLoadedHandler", "id",
        "return jsonrpc." + getDescriptionMethod( entityType ) + "(descriptionLoadedHandler, id)" + ";");
}

function getDescriptionMethod(entityType)
{
    var service = entityType + "InfoService";
    var method = "get" + entityType + "Description";
    return service + '.' + method;
}

/*
    Load description using jsonrpc.
    Parameters:
    - id : id of entity for load description.
    - descriptionLoadedHandler : function will call after script receive data from jsonrpc.
    - errorHandler - function for process errors.
    - saveRequestIdHandler - function to store current request ID (Optional)
*/
DescriptionUtil.prototype.doLoadDescription = function (id, descriptionLoadedHandler, errorHandler, saveRequestIdHandler) {
    try {
        var descriptionUtil = this;
        if (!isRpcReady( [ getDescriptionMethod( this.entityType ) ] )) {
            var func = function() { descriptionUtil.doLoadDescription(id, descriptionLoadedHandler, errorHandler, saveRequestIdHandler); };
            this.loadTimerId = window.setTimeout(func, 200);
            return;
        }
        if (!this.checkServiceAvailable())
            return;
        var getDescription = createGetDescriptionFunc(this.entityType);
        var reqId = getDescription(descriptionLoadedHandler, id);
        if (saveRequestIdHandler) saveRequestIdHandler(reqId);
    } catch (e) {
        errorHandler(e);
    }
}

function createUpdateDescriptionFunc(entityType){
    return new Function("descriptionSavedHandler", "id", "description", 
        "return jsonrpc." + updateDescriptionMethod( entityType ) + "(descriptionSavedHandler, id, description)" + ";");
}

function updateDescriptionMethod( entityType )
{
    var service = entityType + "InfoService";
    var method = "update" + entityType + "Description";
    return service + '.' + method;
}

/*
    SAVE description using jsonrpc.
    Parameters:
    - id : id of entity for save description.
    - description : description for saving.
    - descriptionSavedHandler : function will call after script will save data using jsonrpc.
    - errorHandler - function for process errors.
    - saveRequestIdHandler - function to store current request ID (Optional)
*/
DescriptionUtil.prototype.doSaveDescription = function (id, description, descriptionSavedHandler, errorHandler, saveRequestIdHandler) {
    try {
        var descriptionUtil = this;
        if (!isRpcReady( [ updateDescriptionMethod( this.entityType ) ] )) {
            var func = function() { descriptionUtil.doSaveDescription(id, description, descriptionSavedHandler, errorHandler, saveRequestIdHandler); };
            DescriptionUtil.prototype.tid = window.setTimeout(func, 200);
            return;
        }

        if (!this.checkServiceAvailable())
            return;

        var updateDescription = createUpdateDescriptionFunc(this.entityType);
        var reqId = updateDescription(descriptionSavedHandler, id, description);
        if (saveRequestIdHandler) saveRequestIdHandler(reqId);
    } catch (e) {
        errorHandler(e);
    }
}
