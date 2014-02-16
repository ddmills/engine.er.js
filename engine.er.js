
var eng = function(id, scenario) {
    var g = this;
    
    this.running = false;
    this.paused = false;
    this.hooks = [];
    this.stats = {
        ms: null,
        time: null
    },
    this.constants = {
        GAME_SPEED: 1
    },
    
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
        },
        start: function() {
            console.log('starting viewport');
        }
    }
    
    this.resources = {
        init: function(ob, callback) {
            this.images = {};
            this.__ready = false;
            setTimeout(function() {
                g.resources.__ready = true;
                callback();
            }, 2500);
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
            return true;
        }
        return false;
    }
    
    /* called at game creation */
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
    
    /* starts the game clock and begins update() */
    this.start = function(callback) {
        if(g.__ready() && !g.running) {
            /* set time info */
            var d = new Date(); 
            g.time = d.getTime();
            g.time_started = g.time;
            g.viewport.start();
            g.resources.start();
            g.running = true;
            g.update();
            if (callback)
                callback();
            return true;
        }
        return false;
    }
    
    /* add a hook to the main game loop */
    this.hook = function(hook) {
        if (typeof hook === 'function') {
            this.hooks.push(hook);
            return true;
        }
        return false;
    }
    
    this.update = function() {
        if (g.running && !g.paused) {
            var now = new Date().getTime();
            g.stats.ms = (now - (g.stats.time || now));
            var delta = g.stats.ms * g.constants.GAME_SPEED;
            g.stats.time = now;
            for (hook in g.hooks)
                g.hooks[hook](delta);
            requestAnimationFrame(function() { g.update() });
        }
    }
    
    this.stop = function() {
        this.running = false;
        delete this;
    }
}