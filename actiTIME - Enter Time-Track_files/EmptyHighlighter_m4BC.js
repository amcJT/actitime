function EmptyHighlighter()
{
}

EmptyHighlighter.prototype.highlightTokens = function( text )
{
    return escapeHtmlSymbols(text);
};
