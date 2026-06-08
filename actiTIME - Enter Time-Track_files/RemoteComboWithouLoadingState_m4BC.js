/*
    This class extends Ext.form.ComboBox and prevents showing of a drop-down panel with the "Loading ..." text.
*/

RemoteComboWithouLoadingState = Ext.extend(Ext.form.ComboBox, {

    initComponent : function()
    {
        RemoteComboWithouLoadingState.superclass.initComponent.call(this);

        // this work-around prevents visual glitches when empty results loaded
        var me = this;
        this.store.on("beforeload", function() {
            me.expandDisabled = true;
        });

        this.store.on("load", function() {
            me.expandDisabled = false;
        });
    },

    // this is necessary to avoid 'Loading ...' view
    onBeforeLoad : function(){
        if(!this.hasFocus)
            return;
        this.restrictHeight();
        this.selectedIndex = -1;
    },

    // this work-around prevents visual glitches when empty results loaded
    expand: function() {
        if(!this.expandDisabled)
            RemoteComboWithouLoadingState.superclass.expand.call(this);
    }
});