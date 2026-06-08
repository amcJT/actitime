function TokensHighlighter( tokens, punctuators, hlStart, hlEnd )
{
    this.tokens = tokens;
    this.hlStart = hlStart || "<span class=\"highlightToken\">";
    this.hlEnd = hlEnd || "</span>";
    this.pattern = "(^|[\\s"+ RegExpSpecialSymbols.escapeRegexpSpecialSymbols(punctuators) +"])(";
    this.pattern += RegExpSpecialSymbols.escapeRegexpSpecialSymbols(this.tokens[0]);
    for( var i = 1; i < this.tokens.length; i++ )
        this.pattern += "|" + RegExpSpecialSymbols.escapeRegexpSpecialSymbols(this.tokens[i]);
    this.pattern += ")";
}

TokensHighlighter.prototype.highlightTokens = function( text )
{
    var regexp = new RegExp(this.pattern, "gi");

    var lastIndex = 0;
    var result = "";
    var found = regexp.exec( text );

    while( found )
    {
        var token = found[2];
        result += escapeHtmlSymbols(text.substring( lastIndex, regexp.lastIndex - token.length ));
        result += this.hlStart + escapeHtmlSymbols(token) + this.hlEnd;
        lastIndex = regexp.lastIndex;
        found = regexp.exec( text );
    }
    result += escapeHtmlSymbols(text.substring(lastIndex));
    return result;
};
