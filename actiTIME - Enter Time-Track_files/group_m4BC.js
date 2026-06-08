/**
 * User group entity
 * @param id id of user group
 * @param name name of user group
 * @param nullGroup true if it is bogus group for users not assigned to user group and false otherwise
 */
function Group(id, name, nullGroup)
{
    this.id = id;
    this.name = name;
    this.nullGroup = nullGroup;
}

Group.prototype.getId = function()
{
    return this.id;
};

Group.prototype.getName = function()
{
    return this.name;
};

Group.prototype.isNullGroup = function()
{
    return this.nullGroup;
};

Group.prototype.clone = function()
{
    return new Group(this.id, this.name, this.nullGroup);
};

function groupComparator(a, b) {
    if (a.isNullGroup()) {
        return (b.isNullGroup()) ? 0 : -1;
    }
    if (b.isNullGroup()) {
        return 1;
    }
    return stringComparator(a.name, b.name);
}