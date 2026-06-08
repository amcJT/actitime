/**
 * Some additions to JSONRpcClient class
 * requires jsonrpc.js
 */

var jsonrpc;
var rpcLink;
var prevReadyState = false;

/**
 * Ensures window.jsonrpc object is created and can be used.
 * A new JSONRpcClient object should be created in three cases:
 * 1. If it was not created before.
 * 2. If some exception occurs during previous request. For example, if previous call
 * complete with error because of network problem.
 * 3. When previous ready state was "true".
 * In this case if network error occurs during current request then jsonrpc
 * will try perform query again instead of generate an exception.
 *
 * @param methods (Optional) Array of strings. List of remote service methods which are going
 * to be called by this client.
 * If omitted, the client will make additional asynchronous request to system.listMethods to get
 * full list of available methods. In this case jsonrpc.isReady() will return false until the list is received.
 */
function isRpcReady( methods ) {

    if (!window.jsonrpc || window.jsonrpc.previousRunExceptionOccurs() || prevReadyState) {
        var methodsOrCallback = methods ? methods : JSONRpcClient.prototype.moveToReadyState;
        window.jsonrpc = new JSONRpcClient(methodsOrCallback, window.rpcLink);
        if( methods ) window.jsonrpc.moveToReadyState();
    }

    prevReadyState = jsonrpc.isReady();
    return prevReadyState;
}

JSONRpcClient.prototype.abortAllRequests = function ()
{
    for (var i=0; i<JSONRpcClient.http_spare.length; i++) {
        if (JSONRpcClient.http_spare[i])
            JSONRpcClient.http_spare[i].abort();
    }

    JSONRpcClient.http_spare.length = 0;
    JSONRpcClient.num_req_active = 0;
};

JSONRpcClient.prototype.isReady = function() {
    return !!this.ready;
};

JSONRpcClient.prototype.previousRunExceptionOccurs = function()  {
    return !!this.prevRunException;
};

JSONRpcClient.prototype.moveToReadyState = function (result, ex) {
    if (!ex) {
        this.ready = true;
        this.prevRunException = false;
    } else {
        this.prevRunException = true;
    }
};


