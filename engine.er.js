
var eng = function(id, scenario) {
    var g = this;
    this.ele = $('#' + id);
    this.z = this.ele.css('z-index');
    
    this.state = {
        running: false,
        paused: false,
        started: false,
        loading: null
    }
    
    this.hooks = [];
    
    this.stats = {
        ms: null,
        time: null
    }
    
    this.constants = {
        GAME_SPEED: 1
    }
    
    /* viewport defines the bounds of the game */
    this.viewport = {
        init: function(ob, callback) {
            this.__ready = false;
            this.width = 640;
            this.height = 480;
            this.background = null;
            
            for (k in ob) {
                this[k] = ob[k];
            }
            
            this.ele = $('<div id="_eng_viewport"></div>');
            
            this.ele.css('background', this.background);
            this.ele.css('width', this.width);
            this.ele.css('height', this.height);
            this.ele.css('display', 'block');
            this.ele.css('left', '0px');
            this.ele.css('top', '0px');
            this.ele.css('position', 'relative');
            this.ele.css('overflow', 'hidden');
            
           
            
            this.__ready = true;
            callback();
        },
        start: function() {
            console.log('starting viewport');
            g.ele.append(this.ele);
        }
    }
    
    this.resources = {
        init: function(ob, callback) {
            this.images = {};
            this.__ready = false;
            setTimeout(function() {
                g.resources.__ready = true;
                callback();
            }, 200);
        }, 
        start: function() {
            console.log('starting resources');  
        }
    }
    
    this.layers = {};
    
    this.layer = function(name, ob) {
        this.name = name;
        for (var k in ob)
            this[k] = ob[k];
        
        if (this.fullsize) {
            this.width = g.viewport.width;
            this.height = g.viewport.height;
            this.left = 0;
            this.top = 0;
        }
        
        this.ele = $('<canvas id="_eng_canvas_' + name + '" class="_eng_canvas">');
        this.canvas = this.ele[0];
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
        this.context.rect(0, 0, this.width, this.height);
        this.context.stroke();

        this.ele.css('position', 'absolute');
        this.ele.css('left', this.left + 'px');
        this.ele.css('top', this.top + 'px');
        this.ele.css('z-index', this.z);
    }  
    this.layer.prototype.start = function() {
        g.viewport.ele.append(this.ele);
    }   
    
    this.layers_proxy = {
        init: function(ob, callback) {
            for(var k in ob)
                g.layers[k] = new g.layer(k, ob[k]);
            
            console.log(g.layers);
            this.__ready = true;
            callback();
        },
        start: function() {
            for (var lay in g.layers)
                g.layers[lay].start();
        }
    }
    
    /* called when a manager is ready */
    this.__ready = function(callback) {
        if (g.viewport.__ready &&
            g.resources.__ready &&
            g.layers_proxy.__ready) {
            g.state.loading = false;
            if (callback)
                callback();
            return true;
        }
        return false;
    }
    
    /* called at game creation */
    this.initialize = function(callback) {
        this.state.loading = true;
        var cb = callback;
        this.viewport.init(scenario.viewport, function() {
            g.__ready(cb);
        });
        this.resources.init(scenario.resources, function() {
            g.__ready(cb);
        });
        this.layers_proxy.init(scenario.layers, function() {
            g.__ready(cb);
        });
    }
    
    /* starts the game clock and begins update() */
    this.start = function(callback) {
        if (g.__ready() && !g.state.running) {
            /* set time info */
            var d = new Date(); 
            g.time = d.getTime();
            g.time_started = g.time;
            g.viewport.start();
            g.resources.start();
            g.layers_proxy.start();
            g.state.started = true;
            g.update();
            callback ? callback(): null;
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
    
    /* main game loop */
    this.update = function() {
        if (g.state.started && !g.state.paused) {
            var now = new Date().getTime();
            g.stats.ms = (now - (g.stats.time || now));
            var delta = g.stats.ms * g.constants.GAME_SPEED;
            g.stats.time = now;
            for (hook in g.hooks)
                g.hooks[hook](delta);
            requestAnimationFrame(function() { g.update() });
            
        }
    }
    
    /* stop the game */
    this.stop = function() {
        g.state.started = false;
        delete this;
    }
}