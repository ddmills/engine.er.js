
var eng = function(id) {
    this.val = 1500;
    var me = this;
    
    
    this.cmpt = {
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
        
        /* define a new object that extends parent_name, with properties 'ob' */
        define: function(name, parent_name, ob) {
            if (this.components[name] != undefined) 
                throw new Error('"' + name + '" is already defined');
            if (typeof parent_name != 'function') {
                if (this.components[parent_name] == undefined) {
                    throw new Error('"' + parent_name + '" is an undefined object');
                }
            } else {
                var ob = parent_name;
                parent_name = '_base';
            }  
            this.components[name] = Lineage.define(name, this.components[parent_name], ob);
        },
        
        /* returns and instance of given component name with given constructor arguments */
        create: function() {
            console.log(arguments);
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
    this.cmpt._init();
    
    this.resrc = {
        images: {},
        sprites: {},
        image: function(data, callback) {
            if (data.name == undefined) {
                throw new Error('image name must be defined');
            } else if (data.source == undefined) {
                throw new Error('image source must be defined');
            }
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
    
}