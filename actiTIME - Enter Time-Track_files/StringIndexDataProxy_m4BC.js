/*
This class extends Ext.data.DataProxy and implements loading of data using existing StringIndex
*/

function StringIndexDataProxy( stringIndex, idPropName, dataArray )
{
    StringIndexDataProxy.superclass.constructor.call(this);
    this.stringIndex = stringIndex;
    this.idPropName = idPropName;
    this.dataArray = dataArray;
}

Ext.extend(StringIndexDataProxy, Ext.data.DataProxy, {

    load : function(params, reader, callback, scope, arg)
    {
        var result;
        if( params.searchTokens )
            result = this.filterBy( this.stringIndex.search( params.searchTokens ) );
        else
            result = this.dataArray;

        var o = reader.readRecords(result);
        setTimeout(function() { callback.call(scope, o, arg, true) }, 1);
    },

    filterBy: function( searchResults )
    {
        var result = [];
        for( var i = 0; i < this.dataArray.length; i++ )
        {
            var obj = this.dataArray[i];
            if( searchResults[ obj[this.idPropName] ] != undefined )
                result.push( obj );
        }
        return result;
    }
});