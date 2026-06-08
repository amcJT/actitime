/**
 * Formats, parses, validates number fields and highlightes if there are any errors.
 *
 * requires:
 * inited client_side_errors.js,
 * at_js.jsp,
 * messageResource object with imported corresponding namespace.
 */

/**
 * Creates an instance of BaseNumberValidator
 * @param minNumber is minimum value of the number (can be undefined).
 * @param maxNumber is maximum value of the number (can be undefined).
 * @param digitalGrouping is character to delimit digits in the number. Can be undefined.
 * @param allowPercent  true to allow entering percentage
 */
BaseNumberValidator = function(minNumber, maxNumber, digitalGrouping, allowPercent)
{
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
    this.digitalGrouping = digitalGrouping;
    this.allowPercent = allowPercent;
};

/**
 * Protected
 * Preforms parsing of the string and returns the parsed value
 * Should be overridden in the subclasses
 * @param string is a string to parse
 * @returns null in the string cannot be parsed or number if the parsing was successful
 */
BaseNumberValidator.prototype.doParseNumber = function (string)
{
   return null;
};

/**
* Parses string to number
* If the value is not valid, returns null.
* If the given value is percentage and it is allowed, then percent sign is ignored.
* Use {@link #isPercentage} to check if the entered value is percentage.
* Uses {@link #doParseNumber} to perform the parsing
* @param string is string to parse, not null, not empty, must be validated with {@link #isNumberStringValid}
* @returns parsed number
*/
BaseNumberValidator.prototype.parseNumber = function (string)
{
    if (!this.isNumberStringValid(string))
        return null;
    return this.doParseNumber(string);
};
/**
 * Protected
 * Returns the validation RegEx pattern to validate the string
 * Should bee overridden in the subclasses
 * Used by {@link #isNumberStringValid}
 */
BaseNumberValidator.prototype.getValidationRegEx = function ()
{
    return '.*';
};

/**
 * Returns true if the passed string contains correct number and false otherwise
 * Uses {@link #getValidationRegEx} to check the string
 * @param string is a string to test
 * @returns true if the string is valid and false otherwise
 */
BaseNumberValidator.prototype.isNumberStringValid = function (string)
{
    var trimmedStr = trim( string );
    return trimmedStr.match(this.getValidationRegEx()) != null;
};

/**
 * Verifies if the given value is percentage.
 * If the value is not valid, returns false.
 * If percentage is not allowed, returns false.
 * @param value is string to parse, not null, not empty, must be validated with {@link #isNumberStringValid}
 * @returns boolean
 */
BaseNumberValidator.prototype.isPercentage = function (value)
{
    if (!this.isNumberStringValid(value))
        return false;

    return value.substring(value.length - 1) == "%";
};

/**
 * Formats the number
 * Should be overridden in the subclasses
 * @param value number value to format
 * @returns formatted string representation of the passed number
 */
BaseNumberValidator.prototype.formatNumber = function (value)
{
    return new String(value);
};

/**
 * Formats the number using the separator of groups of digits
 * Should be overridden in the subclasses
 * @param value
 */
BaseNumberValidator.prototype.formatNumberWithDigitSeparator = function(value)
{
    return new String(value);
};

/**
 * Protected
 * Checks that the field value
 *      has correct format
 *      greater or equal to minValue (is minValue was specified)
 *      less or equal to maxValue (is maxValue was specified)
 * Trims and formats it
 * @param field the field which value should be checked (html input text element)
 * @param emptyFieldIsValid true if empty field must be processed as valid
 * @param callbacks set of callbacks one of which will be called depending of the function result. {@see #checkField}
 * @returns true if the field contains correct value and false otherwise
 */
BaseNumberValidator.prototype.doCheckField = function (field, emptyFieldIsValid, callbacks)
{
    var value = trim(new String(field.value));

    if (value != field.value)
        field.value = value;

    if (value == "")
    {
        callbacks.onEmptyValue(field);
        return emptyFieldIsValid;
    }

    if ( !this.isNumberStringValid(value) )
    {
        callbacks.onInvalidString(field, value);
        return false;
    }
    else
    {       
        var numberValue = this.parseNumber(value);

        if (value != "")
            field.value = this.formatNumber(numberValue);        
        if ((!this.maxNumber) || (numberValue <= this.maxNumber))
        {
            if (!this.minNumber || numberValue >= this.minNumber)
            {
                callbacks.onOk(field, value, numberValue);
                return true;
            }
            else
            {
                callbacks.onLessThanMin(field, value, numberValue);
                return false;
            }
        }
        else
        {
            callbacks.onGreaterThanMax(field, value, numberValue);
            return false;
        }
    }
};

/**
 * Checks html input element value for consistency and applies highlighting if needed
 * Calls {@link #doCheckField} with the predefined callbacks set
 * Should be overridden in the subclasses
 * @param field
 * @param emptyFieldIsValid
 * @returns true if the field contains correct value and false otherwise
 */
BaseNumberValidator.prototype.checkField = function (field, emptyFieldIsValid)
{
    var callbacks =
    {
        onEmptyValue: function( field ) {},
        onInvalidString: function( field, value ) {},
        onGreaterThanMax: function( field, value, numberValue ) {},
        onLessThanMin: function(field, value, numberValue) {},
        onOk: function(field, value, numberValue) {}
    };
    return this.doCheckField(field, emptyFieldIsValid, callbacks);
};


/**
 * Creates integer number validator
 * @param minNumber is minimum value of the number (can be undefined).
 * @param maxNumber is maximum value of the number (can be undefined).
 * @param digitalGrouping is character to delimit digits in the number. Can be undefined.
 * @param allowPercent  true to allow entering percentage
 */

IntegerNumbersValidator = function (minNumber, maxNumber, digitalGrouping, allowPercent)
{
    BaseNumberValidator.apply(this, arguments);
};

IntegerNumbersValidator.prototype = new BaseNumberValidator();

/**
 * Returns validation pattern for the signed integer number
 */
IntegerNumbersValidator.prototype.getValidationRegEx = function(  )
{
    var suffix = this.allowPercent ? "%?" : "";
    return '^[\\+|\\-]?\\d+'+ suffix +'$';
};

IntegerNumbersValidator.prototype.doParseNumber = function(string)
{
    return parseInt( trim( string ), 10 );
};


IntegerNumbersValidator.prototype.checkField = function (field, emptyFieldIsValid, maxNumberError, minNumberError, invalidNumberError)
{
    var self = this;
    var callbacks =
    {
        onEmptyValue: function( field )
        {
            if (emptyFieldIsValid)
                ClientSideErrors.markTextFieldAsValid(field);
            else
                ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(invalidNumberError));
        },
        onGreaterThanMax: function( field, value, numberValue )
        {
            ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(maxNumberError,
                            [self.formatNumber(self.maxNumber)]));
        },
        onLessThanMin: function(field, value, numberValue )
        {
            ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(minNumberError,
                            [self.formatNumber(self.minNumber)]));
        },
        onOk: function(field, value, numberValue)
        {
            ClientSideErrors.markTextFieldAsValid(field);
        },
        onInvalidString: function( field, value )
        {
            ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(invalidNumberError));
        }
    };
    return this.doCheckField(field, emptyFieldIsValid, callbacks);
};


IntegerNumbersValidator.prototype.formatNumberWithDigitSeparator = function(value)
{
    value = String(value);

    var digitGroupingSymbol = (this.digitalGrouping) ?
                              this.digitalGrouping : SystemSettings.digitGroupingSymbol;
    if ( (digitGroupingSymbol != "") && (value >= 1000) )
    {
        var separatedValue = "";

        var n = value.length;
        while (n > 3)
        {
            separatedValue = digitGroupingSymbol + value.substr(n - 3, 3) + separatedValue;
            n -= 3;
        }

        if (n > 0)
            separatedValue = value.substr(0, n) + separatedValue;

        return separatedValue;
    }
    return value;
};




/**
 *  Initializes numbers validator instance.
 *
 * @param decimalSeparator is character to separate decimal part of number. Not undefined, not empty.
 * @param digitalGrouping is character to delimit digits in the number. Can be undefined.
 * @param maxNumber is maximum number value (applicable to non-percent values only).
 * @param allowPercent true to allow entering percentage
 */
function FloatNumbersValidator(decimalSeparator, digitalGrouping, maxNumber, allowPercent)
{
    IntegerNumbersValidator.call(this, 0, maxNumber, digitalGrouping, allowPercent);
    this.decimalSeparator = decimalSeparator;
}

FloatNumbersValidator.prototype = new IntegerNumbersValidator();

/**
 * Returns decimal separator that using in the validator.
 */
FloatNumbersValidator.prototype.getDecimalSeparator = function ()
{
    return this.decimalSeparator;
};

FloatNumbersValidator.prototype.doParseNumber = function (string)
{
    string = string.replace(this.decimalSeparator, '.');
    string = string.replace(',', '.');

    if (string == '.') return 0;

    return parseFloat(string);
};

/**
 * Returs pattern to validate a string with double number format (decimal symbols are '.' and ',', equal or greater than zero)
 * and optional percent sign (if allowed)
 */
FloatNumbersValidator.prototype.getValidationRegEx = function(  )
{
    var decimalSeparator = (this.decimalSeparator != undefined) ? this.decimalSeparator : "";
    var suffix = this.allowPercent ? "%?" : "";
    return '^\\d*[' + decimalSeparator + ',.]?\\d*' + suffix + '$';
};

/**
* Formats number. Format is ##.##, where '.' is specified separator for instance.
* @param value is string with number to format.
* @return formated string or "" if value is null, empty or invalid.
*/
FloatNumbersValidator.prototype.formatNumber = function (value)
{
    if ((value == null) || (trim(value) === ""))
        return "";

    var num = new Number(Math.round(value*1000)/1000).toFixed(2);

    if (isNaN(num)) return "";

    var str = new String(num);

    if (this.decimalSeparator != undefined)
        str = str.replace('.', this.decimalSeparator);

    return str;
};

/**
*  Checks number for format, equal or greater than zero,
*  less than maxNumber. Marks field with errors, trims and formats input.
*  @param field is html input text element.
*  @param invalidNumberError - message key to show when number format is invalid.
*  @param maxNumberError - message key to show when number is greater than maxNumber.
*  @param emptyFieldIsValid - true if empty field must be processed as valid
*  @param oldValue - is old value for the field.
*  @returns true if field valid, else false.
*/
FloatNumbersValidator.prototype.checkNumber = function (field, invalidNumberError, maxNumberError, emptyFieldIsValid, oldValue)
{
    var self = this;
    var callbacks =
    {
        onEmptyValue: function( field )
        {
            if (oldValue != "")
                ClientSideErrors.markTextFieldAsValid(field);
        },

        onGreaterThanMax: function( field, value, numberValue )
        {
            ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(maxNumberError,
                        [self.formatNumberWithDigitSeparator(self.maxNumber)]));
        },

        onLessThanMin: function(field, value, numberValue ) {},

        onOk: function(field, value, numberValue)
        {
            ClientSideErrors.markTextFieldAsValid(field);
        },

        onInvalidString: function( field, value )
        {
            if (self.decimalSeparator != undefined)
                ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(invalidNumberError, [self.decimalSeparator]));
            else
                ClientSideErrors.markTextFieldAsInvalid(field, messageResource.getMessage(invalidNumberError));
        }
    };
    return this.doCheckField(field, emptyFieldIsValid, callbacks);
};