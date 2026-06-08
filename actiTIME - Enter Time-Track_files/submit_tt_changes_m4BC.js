function SubmitTTChanges() {}

SubmitTTChanges.registerChange = function(field)
{
    if(field)
    {
        weekTTChanges[field] = true;
    }
}


SubmitTTChanges.unregisterChange = function(fieldName)
{
    if(weekTTChanges[fieldName])
        delete weekTTChanges[fieldName];
}

SubmitTTChanges.hasChanges = function()
{
    var count = 0;
    for(var i in weekTTChanges)
        count++;
    return count > 0;
}
