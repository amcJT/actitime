Ext.apply(Date.prototype,
{
    /**
     * Whether or not the current date is on Daylight Saving Time (DST)
     * @return {Boolean} True if the current date is on DST.
     */
    isDST: function()
    {
        return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
    },

    clearTime : function(clone)
         {
        if (clone)
        {
            return this.clone().clearTime();
        }

        // get current date before clearing time
        var d = this.getDate();

        // clear time
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        // check if clearing the time moved this date into / out of DST
        if (this.getDate() != d)
        {
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule
            // increment hour until cloned date == current date
            //noinspection StatementWithEmptyBodyJS
            for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

            this.setDate(d);
            this.setHours(c.getHours());
        }

        return this;
    }
});