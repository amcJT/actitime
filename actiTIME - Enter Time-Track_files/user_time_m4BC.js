/**
 * This class request system_settings_js.jsp and numbers_validator.js to be included.
 */

UserTime = {}
UserTime.parseTime = function(s, isDigitGroupingSymbolUsed)
{
    if(s == null) return null;

    s = trim(s);

    if(s == '')
        return 0;

    if (isDigitGroupingSymbolUsed)
        s = String(s).replace(SystemSettings.digitGroupingSymbol, '');

    if(s.indexOf(':') != -1)
    {
        return UserTime.parseTimeDelimiterColon(s);
    }
    else if(s.indexOf(SystemSettings.decimalSeparator) != -1  ||
            (s.indexOf('.') != -1)  ||
            (s.indexOf(',') != -1) )
    {
        return UserTime.parseTimeDecimalSeparator(s);
    }
    else
    {
        var h = UserTime.myParseInt(s);
        if(isNaN(h))
            return null;
        else
            return h * 60;
    }
}

UserTime.formatTime = function(n)
{
    var absN = Math.abs(n);
    var result =  Math.round(absN / 60 - absN % 60 / 60) + ":" + leadZero(absN % 60);
    return n < 0 ? '-'+result : result;
}


UserTime.formatTimeWithDigitSeparator = function(time)
{
    var absN = Math.abs(time);
    var hours = String(Math.round(absN / 60 - absN % 60 / 60));

    if ( (SystemSettings.digitGroupingSymbol != "") && (hours >= 1000) )
    {
        var separatedHours = "";

        n=hours.length;
        while(n>3)
        {
            separatedHours = SystemSettings.digitGroupingSymbol + hours.substr(n-3,3) + separatedHours;
            n-=3;
        }

        if (n>0)
            separatedHours = hours.substr(0, n) + separatedHours;

        hours = separatedHours;
    }

    var result =  hours + ":" + leadZero(absN % 60);
    return time < 0 ? '-'+result : result;
}


UserTime.parseTimeDelimiterColon = function(s)
{
    var h = 0;
    var m = 0;
    var i = s.indexOf(':');
    if(i == 0)
    {
        h = 0;
    }
    else
    {
        h = UserTime.myParseInt(s.substring(0, i));
    }

    if(isNaN(h))
            return null;
    if(s.length > i + 1)
    {
        m = UserTime.myParseInt(s.substring(i + 1, s.length));
        if(isNaN(m) || m < 0)
            return null;
    }
    var sign = h < 0 || s.indexOf('-') == 0 ? -1 : 1;
    return h * 60 + m*sign;
}

UserTime.parseTimeDecimalSeparator = function(s)
{
    var validator = new FloatNumbersValidator(SystemSettings.decimalSeparator,
                                         SystemSettings.digitGroupingSymbol)

    var number = validator.parseNumber(s);

    if (number == null)
        return null;

    // here we can safely apply parseFloat function
    return Math.round(number * 60);
}

UserTime.myParseInt = function(s)
{
    var n = parseInt(s, 10);
    if(!/^[+-]?\d+$/.test(s))
        return NaN;
    if(isNaN(n))
        return NaN;
    return n;
}