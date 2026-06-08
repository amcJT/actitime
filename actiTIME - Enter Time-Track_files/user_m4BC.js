function User(id, firstName, lastName, middleName, userName, active, email, groupId)
{
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.userName = userName;
    this.active = active;
    this.email = email;
    this.groupId = groupId;
}

User.prototype.isActive = function()
{
    return this.active;
};

User.prototype.getEmail = function()
{
    return this.email;
};

User.prototype.formatNameFMLU = function()
{
    return UserNameFormat.formatFMLU(this.firstName, this.lastName, this.middleName, this.userName);
};

User.prototype.formatNameFML = function()
{
    return UserNameFormat.formatFML(this.firstName, this.lastName, this.middleName);
};

User.prototype.formatNameLFMU = function()
{
    return UserNameFormat.formatLFMU(this.firstName, this.lastName, this.middleName, this.userName);
};

User.prototype.getGroupId = function()
{
    return this.groupId;
};

User.prototype.clone = function( )
{
    return new User(this.id, this.firstName, this.lastName, this.middleName, this.userName, this.active, this.email, this.groupId);
};

User.prototype.hasEmail = function( )
{
    return this.email ? true : false;
};

function UserWithAccessRights(id, firstName, lastName, middleName, userName, active, email, groupId, accessRights)
{
    User.call(this, id, firstName, lastName, middleName, userName, active, email, groupId);

    this.accessRight = accessRights;
    this.assignedProjects = [];
}

//noinspection JSCheckFunctionSignatures
UserWithAccessRights.prototype = new User();

UserWithAccessRights.prototype.setAssignedProjects = function( projects )
{
    this.assignedProjects = projects ? projects : [];
};

UserWithAccessRights.prototype.setAllProjectAssigned = function ( flag )
{
    this.allProjectsAssigned = flag;
};

UserWithAccessRights.prototype.hasProjectsAssigned = function ( projects )
{
    if ( this.allProjectsAssigned )
        return true;
    if ( !this.assignedProjects )
        return false;
    for( var i = 0; i < this.assignedProjects.length; i++)
    {
        if ( contains( projects, this.assignedProjects[i] ) )
            return true;
    }
    return false
};

UserWithAccessRights.prototype.clone = function( )
{
    var res = new UserWithAccessRights(this.id, this.firstName, this.lastName, this.middleName, this.userName, this.active,
                                       this.email, this.groupId, this.accessRight);
    res.allProjectsAssigned = this.allProjectsAssigned;
    res.assignedProjects = this.assignedProjects;
    return res;
};