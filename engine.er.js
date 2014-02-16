
var eng = function(id, scenario) {
    var g = this;

    /* viewport defines the bounds of the game */
    this.viewport = {
        init: function(ob, callback) {
            this.__ready = false;
            this.width = 640;
            this.height = 480;
            this.background = null;
            for (k in ob)
                this.k = ob.k;
            this.__ready = true;
            callback();
        }
    }
    
    this.resources = {
        init: function(ob, callback) {
            this.images = {};
            this.__ready = false;
            setTimeout(function() {
                g.resources.__ready = true;
                callback();
            }, 5000);
        }, 
        start: function() {
            console.log('starting resources');  
        }
    }
    
    this.__ready = function(callback) {
        if (g.viewport.__ready &&
            g.resources.__ready) {
            this.loading = false;
            if (callback)
                callback();
        }
    }
    
    this.initialize = function(callback) {
        this.loading = true;
        var cb = callback;
        this.viewport.init(scenario.viewport, function() {
            g.__ready(cb);
        });
        this.resources.init(scenario.resources, function() {
            g.__ready(cb);
        });
    }
    
    
    
    
    this.start = function(callback) {
        /* set time info */
        var d = new Date(); 
        this.time = d.getTime();
        this.time_started = this.time;
        this.started = true;
        this.viewport.start();
    }
}