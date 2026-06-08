var timeout = 10000;
var jsonrpc;
var currentRpcControlManager = undefined;
var retryController = undefined;

/*
 * Base manager class for all page control updating data via rpc.
 */
function RpcControlManager() { }

/*
 * General prefix for message names shown by manager.
 */
RpcControlManager.prototype.messagePrefix = "";

/**
 * ID of the request made by <code>makeRemoteCall</code> method or <code>null</code> if no request has been made
 */
RpcControlManager.prototype.requestId = null;

/*
 * Set initial manager state if needed.
 */
RpcControlManager.prototype.init = function()
{
    /* note: inheritor should override this method */
}

/*
 * Call remote service to change control data.
 *
 * @return Request ID
 */
RpcControlManager.prototype.makeRemoteCall = function(callback)
{
    /* note: inheritor should override this method */
}

/*
 * Get remote service used for state changing.
 */
RpcControlManager.prototype.getService = function()
{
    /* note: inheritor should override this method */
}

/**
 * Get list of service methods used by this manager as array of strings
 */
RpcControlManager.prototype.getMethods = function()
{
    /* note: inheritor should override this method */
}

/*
 * Return message text, which will be shown to user when remote call timeout exceeded.
 */
RpcControlManager.prototype.getTimeoutMsg = function()
{
    /* note: inheritor should override this method */
}

/*
 * Handle specific errors.
 * Return true if error was handled, othervise false.
 */
RpcControlManager.prototype.handleSpecificError = function(exception)
{
    /* note: inheritor can override this method for specific error handling*/
    return false;
}

RpcControlManager.prototype.beginSavingData = function()
{
    /* note: inheritor should override this method */
}

RpcControlManager.prototype.endSavingData = function(success)
{
    /* note: inheritor should override this method */
}

/*
 * Event is fired after changing cell state is complete.
 */
RpcControlManager.prototype.onDataSavingComplete = function(result)
{
    /* note: inheritor should override this method */
}

RpcControlManager.prototype.setRequestId = function(id) {
    this.requestId = id;    
};

RpcControlManager.prototype.getRequestId = function() {
    return this.requestId;
}

RpcControlManager.prototype.handleError = function(exception)
{
    if (!this.handleSpecificError(exception))
    {
        alert(this.getRpcErrorMsg());
        this.endSavingData(false);
    }
}

RpcControlManager.prototype.getRpcErrorMsg = function()
{
    /* note: inheritor should override this method */
    return "";
}


function saveRpcControlBoundData(manager, isSilent)
{
    if (isRpcBusy())
    {
        return;
    }

    currentRpcControlManager = manager;
    currentRpcControlManager.init();
    currentRpcControlManager.beginSavingData();

    retryController = new RpcRetryController(
            isSilent ? null : timeout,
            function() { saveRpcControlBoundDataWithDelay() },
            function() { timeoutSaving() },
            function( exception ) { processRpcError( exception ) }
        );
    retryController.start();
}

function saveRpcControlBoundDataWithDelay()
{
    try
    {
        if (!isRpcReady( currentRpcControlManager.getMethods() ))
        {
            if (isRpcBusy())
            {
                retryController.retry();
            }
            return;
        }

        if (isRpcBusy() && currentRpcControlManager.getService())
        {
            var reqId = currentRpcControlManager.makeRemoteCall(rpcControlCallback);
            currentRpcControlManager.setRequestId(reqId);
        }
        else
        {
            /* service is unavailable, most likely we've been logged out */
            document.location.reload();
        }
    }
    catch(e)
    {
        if (isRpcBusy()) retryController.handleErrorOrRetry( e );
    }
}

function rpcControlCallback(result, exception)
{
    if( isRpcBusy( ) )
    {
        if( exception != null )
        {
            retryController.handleErrorOrRetry( exception );
        }
        else
        {
            currentRpcControlManager.endSavingData( true );
            currentRpcControlManager.onDataSavingComplete( result );
            cleanup( );
        }
    }
}

function cleanup()
{
    if (isRpcBusy())
    {
        if( retryController )
        {
            retryController.stop();
            retryController = undefined;
        }        
        currentRpcControlManager = undefined;
    }
}

function processRpcError(exception)
{
    if (exception.name.indexOf('com.actimind.actitime.services.NoRightsForRemoteCallException') != -1)
    {
        document.location.reload();
        return;
    }

    currentRpcControlManager.handleError(exception);

    cleanup();
}

function isRpcBusy()
{
    return currentRpcControlManager != undefined;
}

function timeoutSaving()
{
    if( isRpcBusy( ) )
    {
        var currentRequest = currentRpcControlManager.getRequestId( );
        if( currentRequest )
        {
                JSONRpcClient.cancelRequest( currentRequest );
        }
        jsonrpc.abortAllRequests( );

        var msg = currentRpcControlManager.getTimeoutMsg( );
        if( !confirm( msg ) )
        {
            currentRpcControlManager.endSavingData( false );
            cleanup( );
        }
        else
        {
            if( retryController )
            {
                retryController.stop( );
                retryController.start( );
            }
        }
    }
}

function setRpcTimeout( newTimeout )
{
    timeout = newTimeout;
}