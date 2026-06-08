UserNameFormat = {};

UserNameFormat.formatLFMU = function ( firstName, lastName, middleName, username )
{
    var result = lastName + ", " + firstName;
    if( middleName && middleName.length > 0 )
        result += " " + middleName + ".";
    return result + " (" + username + ")";
};

UserNameFormat.formatFML = function ( firstName, lastName, middleName )
{
    var result = firstName;
    if( middleName && middleName.length > 0 )
        result += " " + middleName + ".";
    return result + " " + lastName;
};

UserNameFormat.formatFMLU = function ( firstName, lastName, middleName, username )
{
    return UserNameFormat.formatFML( firstName, lastName, middleName ) + " (" + username + ")";
};