var eng = function(id, game) {
    var g = this;
    
    for (layer in game.layers {
        
    }
    
    
    this.viewport = {
        width: 640,
        height: 480,
        background: null;
        init: function(ob) {
            for (k in ob) {
                this.k = ob.k;
            }
        }
    }
    
    this.constants = {
        VIEW_WIDTH: 800,
        VIEW_HEIGH: 600
    }
    
    this.components = {
        _init: function() {
            this.components = {};
            
            /* base component */
            this.components['_base'] = Lineage.define('_base', function(p, start) {
                p.initialize = initialize;
                function initialize(name, start) {
                    this.name = name;
                    this.position = start;
                    console.log('in _base constructor');
                }
                
                p.draw = draw;
                function draw() {
                    if (this.image)
                        console.log('drawing image of : ' + this.image.source);
                }
                
                p.move = move;
                function move(x, y) {
                    this.position.x += x;
                    this.position.y += y;
                }
            });
        },
        
        /* define a new object that extends parent_name, with properties 'opts' */
        def: function(name, parent, opts) {        
            if (opts == undefined && typeof parent == 'Object') {
                opts = parent;
                parent = '_base';
            }
            
            if (name == undefined)
                throw new Error('a name variable must be defined');
            
            if (this.components[name] != undefined)
                throw new Error('"' + name + '" is already a defined component');
            
            if (this.components[parent] == undefined)
                throw new Error('cannot derive from parent. "' + parent + '" is not a defined component.');
            
            var s = '';
            for (var k in opts) {
                if (typeof opts[k] === 'string')
                    opts[k] = '\'' + opts[k] + '\'';
                if (typeof opts[k] === 'object')
                    throw new Error('cannot nest objects, property "' + k + '" of user-defined component "' + name + '" is an object');
                s += 'p.' + k + ' = ' + opts[k] + '; ';
            }
            
            var f = new Function(['p', 'parent', 'game'], s);
            var p = this.components[parent];
            this.components[name] = Lineage.define(name, p, f);
        },
        
        /* returns and instance of given component name with given constructor arguments */
        create: function() {
            var params = Array.prototype.slice.call(arguments);
            var name = params.shift()
            var constr = this.components[name];
            if (constr == undefined) {
                throw new Error('component "' + name = '" is undefined');
            } else {
                var instance = Object.create(constr.prototype);
                var name = constr.apply(instance, params);
                return typeof name === 'object' ? name : instance;
            }
        }
    }
    
    this.resources = {
        images: {},
        sprites: {},
        image: function(data, callback) {
            if (data.name == undefined)
                throw new Error('image name must be defined');
            if (data.source == undefined)
                throw new Error('image source must be defined');
            
            
            var me = this;   
            data.ob = new Image();
            data.loaded = false;         
            me.images[data.name] = data;
            data.ob.onload = (function() {
                data.loaded = true;
                if (me.callback) {
                    me.callback();
                }
            });
            data.ob.onerror = function() {
                return false;
            }
            data.ob.src = data.source;
            return data;
        }
    }
 

    this.components._init();