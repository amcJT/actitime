function StringIndex( punctuators )
{
    this.index = {};
    this.punctuators = punctuators || StringIndex.DEFAULT_PUNCTUATORS;
    this.replacePunctuatorsPattern = new RegExp("[" + RegExpSpecialSymbols.escapeRegexpSpecialSymbols( this.punctuators ) + "]+", "g");
}

StringIndex.DEFAULT_PUNCTUATORS = "()-,.\"':";

StringIndex.prototype.getPunctuators = function()
{
    return this.punctuators;
};

StringIndex.prototype.addToken = function( token, objId )
{
    var firstChar = token.charAt(0);
    var firstCharObject = this.index[firstChar];
    if( !firstCharObject )
    {
        firstCharObject = {};
        this.index[firstChar] = firstCharObject;
    }
    var tokenObject = firstCharObject[token];
    if( !tokenObject )
    {
        tokenObject = {};
        firstCharObject[token] = tokenObject;
    }
    tokenObject[ objId ] = objId;
};

StringIndex.prototype.addTokens = function( tokens, objId )
{
    for( var i = 0; i < tokens.length; i++ )
        this.addToken( tokens[i], objId );
};


StringIndex.prototype.add = function( str, objId )
{
    var tokens = this.tokens( str );
    this.addTokens( tokens, objId );
};

StringIndex.prototype.tokens = function( s )
{
    var results = [];
    var duplicates = {};
    var words = s.toLowerCase().replace(this.replacePunctuatorsPattern, " ").split(/\s+/);

    for (var i=0; i< words.length; i++)
    {
        var w = words[i];
        if (w.length > 0 && !duplicates[w])
        {
            results.push(w);
            duplicates[w] = 1;
        }
    }

    return results;
};

StringIndex.prototype.search = function( tokens )
{
    var result = {};

    if( tokens.length == 0 )
        return result;

    this.addIdsForToken( tokens[0], result );

    for( var i = 1; i < tokens.length; i++ )
        result = this.intersectWithSearchResultsForToken( tokens[i], result );

    return result;
};

StringIndex.prototype.addIdsForToken = function( token, result )
{
    var firstChar = token.charAt(0);
    var firstCharObject = this.index[firstChar];
    if( firstCharObject )
    {
        for( var str in firstCharObject )
        {
            //noinspection JSUnfilteredForInLoop
            if( str.lastIndexOf( token, 0 ) === 0 )
            {
                //noinspection JSUnfilteredForInLoop
                var strObj = firstCharObject[str];
                for( var id in strObj )
                {
                    //noinspection JSUnfilteredForInLoop
                    result[id] = id;
                }
            }
        }
    }
};

StringIndex.prototype.intersectWithSearchResultsForToken = function( token, result )
{
    var intersection = {};
    var firstChar = token.charAt(0);
    var firstCharObject = this.index[firstChar];
    if( firstCharObject )
    {
        for( var str in firstCharObject )
        {
            //noinspection JSUnfilteredForInLoop
            if( str.lastIndexOf( token, 0 ) === 0 )
            {
                //noinspection JSUnfilteredForInLoop
                var strObj = firstCharObject[str];
                for( var id in strObj )
                {
                    //noinspection JSUnfilteredForInLoop
                    if( result[id] )
                        //noinspection JSUnfilteredForInLoop
                        intersection[id] = id;
                }
            }
        }
    }
    return intersection;
};
