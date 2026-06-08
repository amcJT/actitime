function TextAreaLengthNote(divId, entityName, maxValue)
{
    this.divId = divId;
    this.maxValue = maxValue;

    this.descLengthSpanName = divId + 'Value';
    var span = document.getElementById(divId + 'Entity');
    if(span)
    {
        span.firstChild.nodeValue = entityName;
    }
    span = document.getElementById(divId + 'Max');
    if(span)
    {
        span.firstChild.nodeValue = maxValue;
    }

    this.textLengthCounter = this.trimCounter;
}

TextAreaLengthNote.prototype.update =
function TextAreaLengthNote_update(textAreaValue)
{
    this.textLength = this.countLength( textAreaValue );
    var span = document.getElementById(this.descLengthSpanName);
    if(span)
    {
        span.firstChild.nodeValue = this.textLength;
        if(this.textLength > this.maxValue)
        {
            span.style.color = 'red';
        }
        else
        {
            span.style.color = '';
        }
    }
}


TextAreaLengthNote.prototype.getTextLength = function ()
{
    return this.textLength;
};

TextAreaLengthNote.prototype.show =
function TextAreaLengthNote_show()
{
    document.getElementById(this.divId).style.display = 'block';
}

TextAreaLengthNote.prototype.hide =
function TextAreaLengthNote_hide()
{
    document.getElementById(this.divId).style.display = 'none';
}

TextAreaLengthNote.prototype.countLength = function ( str )
{
    return this.textLengthCounter( str );
}

TextAreaLengthNote.prototype.trimCounter =
function TextAreaLengthNote_trimCounter( str )
{
    return trim( getStringWithUnifiedNewLineSymbol(str) ).length
}

TextAreaLengthNote.prototype.fullCounter =
function TextAreaLengthNote_fullCounter( str )
{
    return str.length
}

TextAreaLengthNote.prototype.setTextLengthCounter = function ( counter )
{
    this.textLengthCounter = counter;
}