function RpcRetryController( timeout, onRetry, onTimeout, onError )
{
    this.interval = timeout;
    this.onRetry = onRetry;
    this.onTimeout = onTimeout;
    this.onError = onError;
    this.tid = null;
}

RpcRetryController.prototype.start = function()
{
    // id interval is null retries will never stop
    if( this.interval != null )
    {
        var self = this;
        this.tid = window.setTimeout( function() { self.timeout() }, this.interval );
    }

    this.onRetry();
};

RpcRetryController.prototype.stop = function()
{
    if( this.tid != null )
    {
        window.clearTimeout( this.tid );
        this.tid = null;
    }
};

RpcRetryController.prototype.timeout = function()
{
    this.stop();
    this.onTimeout();
};

RpcRetryController.prototype.handleErrorOrRetry = function( exception )
{
    if( this.isConnectionFailure( exception ) )
    {
        this.retry();
        return true;
    }
    else if( this.isServiceUnavailable( exception ) )
    {
        /* service is unavailable, most likely we've been logged out */
        document.location.reload();    
    }
    else
    {
        this.stop();
        this.onError( exception );
        return false;
    }
};

RpcRetryController.prototype.retry = function()
{
    var self = this;
    window.setTimeout( function() { self.onRetry() } , 200);
};

/*
 * Check if given exception is the result of connection failure
 */
RpcRetryController.prototype.isConnectionFailure = function( exception )
{
    if( !exception || typeof(exception.code) == typeof(undefined) ) return false;

    // all but CODE_ERR_CLIENT which indicates connection problems
    var jsonErrorCodes = [ JSONRpcClient.Exception.CODE_REMOTE_EXCEPTION,
                           JSONRpcClient.Exception.CODE_ERR_PARSE,
                           JSONRpcClient.Exception.CODE_ERR_NOMETHOD,
                           JSONRpcClient.Exception.CODE_ERR_UNMARSHALL,
                           JSONRpcClient.Exception.CODE_ERR_MARSHALL ];

    // in some cases jabsorb uses XMLHttpRequest status property as exception code
    // which is different for different browsers,
    // but codes for other errors are defined
    // so we may check if our error is NOT a connection failure
    for( var i = 0; i < jsonErrorCodes.length; i++ )
    {
        if( exception.code == jsonErrorCodes[i] ) return false;
    }
    return true;
};

/*
 * Check if service is unavailable
 */
RpcRetryController.prototype.isServiceUnavailable = function( exception )
{
    if( !exception || typeof(exception.code) == typeof(undefined) ) return false;

    return exception.code == JSONRpcClient.Exception.CODE_ERR_NOMETHOD;
};
