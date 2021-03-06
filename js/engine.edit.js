var editor = function(scenario) {
    var e = this;
    
    this.resize = function() {
        var area_w = $('#area-left').width();
        var area_h = $('#area-left').height();
        
        var view_w = parseInt(e.viewport.ob.width); 
        var view_h = parseInt(e.viewport.ob.height);
        
        var most_left = 0
        var most_right = view_w;
        var most_top = 0
        var most_bottom = view_h;
    
        for (layer in e.layers) {
            var layer = e.layers[layer];
            var w = parseInt(layer.width);
            var h = parseInt(layer.height);
            var left = parseInt(layer.x);
            var top = parseInt(layer.y)
            
            if (left < most_left) {
                most_left = left;
            }
            if (left + w > most_right) {
                most_right = left + w;
            }
            
            if (top < most_top) {
                most_top = top;
            }
            if (top + h > most_bottom) {
                most_bottom = top + h;
            }
        }
        
        most_left = Math.abs(most_left);
        most_top = Math.abs(most_top);

        var max_w = most_left + most_right + 200;
        var max_h = most_top + most_bottom + 200;

        if (max_w < area_w) {
            max_w = area_w;
            most_left = area_w/2 - view_w/2 - 100;
        }
        if (max_h < area_h) {
            max_h = area_h;
            most_top = area_h/2 - view_h/2 - 100;
        }
        
        $('#editor').css('width', max_w + 'px');
        $('#editor').css('height', max_h + 'px');
        
        $('#editor-viewport').css('left', most_left + 100 + 'px');
        $('#editor-viewport').css('top', most_top + 100 + 'px');
    }
    this.file = {
        init : function(scenario) {
            this.storage = window.localStorage;
            if (scenario) {
                this.load_scenario(scenario);
            } else {
                var last = this.storage.getItem('__editor___previous');
                if (last) {
                    this.load_scenario(last);
                } else {
                    this.new_scenario('untitled');
                }
            }
        },
        /* used when you hit 'new scenario' button */
        default_scenario : {
            viewport: {
                width: 640,
                height: 480,
                background: 'black'
            }
        },
        /* re-name a scenario*/
        rename_scenario: function(oldname, newname) {
            this.current_file = newname;
            this.storage.setItem('__editor___previous', newname);
        },
        /* load a scenario given a name */
        load_scenario : function(name) {
            var scen = this.storage.getItem('__scenarios_' + name);
            if (scen) {
                scen = this.parse_json(scen);
                this.clear_scenario();
                this.current_scenario = scen;
                this.current_file = name;
                e.init();
                this.storage.setItem('__editor___previous', name);
                $('#header-filename').html(name);
                return true;
            }
            return false;
        },
        /* returns an array of all scenario names */
        get_scenarios : function() {
            var keys = [];
            for (var i = 0; i < this.storage.length; i++) {
                var k = this.storage.key(i);
                if (k.substring(0, 12) == '__scenarios_') {
                    keys.push(k.substring(12, k.length));
                }
            }
            return keys;
        },
        /* creates a new default scenario */
        new_scenario : function() {
            console.log('new scenario');
            this.clear_scenario();
            this.current_file = 'untitled';
            $('#header-filename').html(this.current_file);
            this.current_scenario = this.default_scenario;
            e.init();
        },
        /* saves a scenario with a given name */
        save_scenario : function(name) {
            if (name == undefined) {
                name = this.current_file;
            }
            this.storage.setItem('__scenarios_' + name, this.get_json(this.current_scenario));
            this.storage.setItem('__editor___previous', name);
            $('#header-filename').html(this.current_file);
            return true;
        },
        /* removes the current scenario */
        clear_scenario: function() {
            this.current_scenario = null;
        },
        /* parses given json into an object */
        parse_json : function(json) {
            return JSON.parse(json);
        },
        /* returns the json for a scenario. pretty will output with tabs */
        get_json : function(scenario, pretty) {
            if (scenario == undefined)
                scenario = this.current_scenario;
                
            if (pretty)
                return JSON.stringify(scenario, undefined, 4);
            
            return JSON.stringify(scenario);
        }
    },
    
    this.get_grid = function(w, h, color) {
        var can = $('#canvas-create-grid');
        var ctx = can[0].getContext('2d');
        can.attr('width', w);
        can.attr('height', h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.stroke();
        return dataURL = can[0].toDataURL();
    }
    
    
    this.viewport = {
        init: function() {
            this.grid_width = 16;
            this.grid_height = 16;
            this.grid_color = '#1A1A1A';
            this.ob = e.file.current_scenario.viewport;
            $('#editor').html("<div id='editor-notify' class='alert-area'></div>");
            this.ele = $("<div id='editor-viewport'></div>");
            this.ele.css('opacity', 0);
            $('#editor').append(this.ele);
            e.resize();
            setTimeout(function() {
                e.viewport.reset_view(true);
            }, 500);
        },
        set_size: function(width, height) {
            this.ob.width = width;
            this.ob.height = height;
            this.reset_view();
            e.resize();
            e.layers.viewport_resized();
        },
        set_background: function(background) {
            this.ob.background = background;
            this.reset_view();
        },
        reset_view: function(fade) {
            if (fade)
                this.ele.css('opacity', 0);
            this.ele.css('width', this.ob.width);
            this.ele.css('height', this.ob.height);
            this.ele.css('background', this.ob.background);
            //this.draw_grid();
            if (fade)
                this.ele.fadeTo(1000, 1);
            e.resize();
            $('#viewport-width').val(this.ob.width);
            $('#viewport-height').val(this.ob.height);
            $('#viewport-bkg-color').val(this.ob.background);
        }
    },
    this.game = {
        init: function() {
            this.namespace = {
                g: null
            }
            this.running = false;
            this.ele = undefined;
            this.ready = false;
        },
        game_create: function() {
            if (!this.running) {
                $('#area-editing-shelf').hide(250);
                $('#area-game-shelf').show(500);
                $('#btn-loadjson').prop('disabled', true);
                $('#btn-savejson').prop('disabled', true);
                $('#btn-load').prop('disabled', true);
                $('#btn-saveas').prop('disabled', true);
                $('#btn-save').prop('disabled', true);
                $('#btn-new').prop('disabled', true);
                $('#btn-game-test').prop('disabled', true);
                $('#btn-game-start').prop('disabled', true);
                $('#btn-game-quit').prop('disabled', false);
                this.ele = $("<div id='editor-viewport-game'></div>");
                $('#editor-viewport').css('background-image', 'none');
                $('#editor-viewport').append(this.ele);
                this.namespace.g = new eng('editor-viewport-game', e.file.current_scenario);
                this.start = new Date().getTime();
                this.namespace.g.initialize(this.game_ready);
                e.layers.game_start();
                this.running = true;
            }
        },
        game_ready: function() {
            if (e.game.running) {
                var end = new Date().getTime();
                $('#btn-game-start').show(100);
                $('#lbl-game-status').html('loaded in ' + (end - e.game.start)/1000 + ' seconds');
                $('#btn-game-start').prop('disabled', false);
                e.game.ready = true;
            }
        },
        game_stop: function() {
            if (this.running) {
                e.viewport.reset_view(false);
                this.namespace.g.stop();
                delete this.namespace;
                this.namespace = {};
                this.ele.remove();
                $('#area-game-shelf').hide(250);
                $('#area-editing-shelf').show(500);
                $('#game-fps').hide();
                $('#game-time').hide();
                $('#game-ms').hide();
                $('#lbl-game-status').html('loading...');
                $('#btn-loadjson').prop('disabled', false);
                $('#btn-savejson').prop('disabled', false);
                $('#btn-load').prop('disabled', false);
                $('#btn-saveas').prop('disabled', false);
                $('#btn-save').prop('disabled', false);
                $('#btn-new').prop('disabled', false);
                $('#btn-game-test').prop('disabled', false);
                $('#btn-game-quit').prop('disabled', true);
                e.layers.game_stop();
                this.running = false;
            }
        },
        game_start: function() {
            if (this.ready) {
                this.namespace.g.start();
                $('#btn-game-start').prop('disabled', true);
                $('#game-fps').show(100);
                $('#game-time').show(100);
                $('#game-ms').show(100);
                this.namespace.g.hook(e.game.game_update);
            }
            return this.ready;
        },
        game_update: function(delta) {
            $('#lbl-game-fps').html(parseInt(1000/delta));
            $('#lbl-game-ms').html(delta);
            $('#lbl-game-time').html(e.game.namespace.g.stats.time);
        }
        
    }

    this.wrapper_image = function(name, ob, callback) {
        this.name = name;
        this.ob = ob;
        this.source = ob.source;
        this.time = new Date().getTime();
        this.img = new Image();
        var me = this;
        this.img.onload = function() { 
            e.resources.ob.images[name] = me.ob;
            var opt = $("<div class='big-list-item' id='res-image-item-" + me.name + "'>" +
                "<p class='big-list-item-title' id='title-res-image-" + me.name +  "'>" + me.name + "</p>" +
                "<div class='btn-group big-list-item-controls'>" +
                "<button title='delete' class='btn btn-default btn-xs btn-img-delete' id='btn-image-delete-" + me.name + "'><span class='glyphicon glyphicon-trash'></span></button>" +
                "<button title='refresh' class='btn btn-default btn-xs btn-img-refresh' id='btn-image-refresh-" + me.name + "'><span class='glyphicon glyphicon-refresh'></span></button>" +
                "</div></div>");
                
            $('#res-images-list').append(opt);
            $('#images-thumbs').show(500);

            
            callback ? callback(true) : null; 
        }
        this.img.onerror = function() { callback ? callback(false) : null; }
        this.img.src = this.source + '?time=' + this.time;
        this.users = {};
    }
    this.wrapper_image.prototype.refresh = function(callback) {
        this.time = new Date().getTime();
        this.img.onload = function() { callback ? callback(true) : null; }
        this.img.onerror = function() { callback ? callback(false) : null; }
        this.img.src = this.source + '?time=' + this.time;
    }
    this.wrapper_image.prototype.remove = function() {
        $('#res-image-item-' + this.name).remove();
        for (var user in this.users) {
            users[user].notify_img_remove(this);
        }
        delete e.resources.images[this.name];
        delete e.resources.ob.images[this.name];
        delete this;
    }
    
    
    this.wrapper_sprite = function(name, ob, callback) {
        this.name = name;
        this.ob = ob;
        this.source = ob.source;
        this.time = new Date().getTime();
        this.img = new Image();
        var me = this;
        this.img.onload = function() { 
            e.resources.ob.sprites[name] = me.ob;
            var opt = $("<div class='big-list-item' id='res-sprite-item-" + me.name + "'>" +
                "<p class='big-list-item-title' id='title-res-sprite-" + me.name +  "'>" + me.name + "</p>" +
                "<div class='btn-group big-list-item-controls'>" +
                "<button title='delete' class='btn btn-default btn-xs btn-sprite-delete' id='btn-sprite-delete-" + me.name + "'><span class='glyphicon glyphicon-trash'></span></button>" +
                "<button title='refresh' class='btn btn-default btn-xs btn-sprite-refresh' id='btn-sprite-refresh-" + me.name + "'><span class='glyphicon glyphicon-refresh'></span></button>" +
                "</div></div>");
                
            $('#res-sprites-list').append(opt);
            $('#sprite-thumbs').show(500);
            
            me.size = {w: this.width/me.ob.clips.x, h: this.height/me.ob.clips.y};
            
            callback ? callback(true) : null; 
        }
        this.img.onerror = function() { callback ? callback(false) : null; }
        this.img.src = this.source + '?time=' + this.time;
        this.users = {};
    }
    this.wrapper_sprite.prototype.refresh = function(callback) {
        this.time = new Date().getTime();
        this.img.onload = function() { callback ? callback(true) : null; }
        this.img.onerror = function() { callback ? callback(false) : null; }
        this.img.src = this.source + '?time=' + this.time;
    }
    this.wrapper_sprite.prototype.remove = function() {
        $('#res-sprite-item-' + this.name).remove();
        for (var user in this.users) {
            users[user].notify_img_remove(this);
        }
        delete e.resources.sprites[this.name];
        delete e.resources.ob.sprites[this.name];
        delete this;
    }
    
    
    this.resources = {
        init: function() {
            this.ob = e.file.current_scenario.resources;
            this.images = {};
            this.sprites = {}
            $('#res-images-list').html('');
            $('#res-sprites-list').html('');
            
            if (this.ob == undefined) {
                e.file.current_scenario['resources'] = {
                    images: {},
                    sprites: {}
                }
                this.ob = e.file.current_scenario.resources;
            }
            
            for (var key in this.ob.images)
                this.add_img(key, this.ob.images[key]);

            for (var key in this.ob.sprites)
                this.add_sprite(key, this.ob.sprites[key]);
        },
        add_img: function(name, options, callback) {
            if (this.images[name] == undefined) {
                var img = new e.wrapper_image(name, options, function(success) {
                    if (success) {
                        e.resources.images[name] = img;
                        callback ? callback(true, 'image added successfully') : null;
                    } else {
                        callback ? callback(false, 'image at "' + options.source + '" could not be loaded') : null;
                    }
                });
            } else {
                callback ? callback(false, 'image name "' + name + '" is already taken') : null;
            }
        },
        remove_img: function(name) {
            if (this.images[name] != undefined) {
                this.images[name].remove();
            }
        },
        refresh_img: function(name, callback) {
            if (this.images[name] != undefined) {
                this.images[name].refresh(callback);
            }
        },
        add_sprite: function(name, options, callback) {
            if (this.sprites[name] == undefined) {
                var sprite = new e.wrapper_sprite(name, options, function(success) {
                    if (success) {
                        e.resources.sprites[name] = sprite;
                        callback ? callback(true, 'sprite added successfully') : null;
                    } else {
                        callback ? callback(false, 'sprite at "' + options.source + '" could not be loaded') : null;
                    }
                });
            } else {
                callback ? callback(false, 'sprite name "' + name + '" is already taken') : null;
            }
        },
        remove_sprite: function(name) {
            if (this.sprites[name] != undefined) {
                this.sprites[name].remove();
            }
        },
        refresh_sprite: function(name, callback) {
            if (this.sprites[name] != undefined) {
                this.sprites[name].refresh(callback);
            }
        }
    }

    this.wrapper_layer = function(name, opts) {
        e.file.current_scenario.layers[name] = opts;
        this.ob = e.file.current_scenario.layers[name];
        this.name = name;
        this.visible = true;
        this.ele_container_div = $("<div class='editor-layer-container' id='editor-layer-container-"+this.name+"'></div>");
        this.ele_content_div = $("<div class='editor-layer-contents' id='layer-contents-'"+this.name+"'></div>");
        this.ele_text_div = $("<p class='editor-layer-text'>" + this.name + "</p>");
        this.ele_list_div = $("<div class='big-list-item layer-item' id='layer-view-" + name + "'>" +
            "<p class='big-list-item-title' id='title-layer-edit-" + name +  "'>" + name + "</p>" +
            "<div class='btn-group big-list-item-controls'>" +
                "<button title='show or hide' type='button' class='btn btn-default btn-xs btn-layer-vis' id='btn-layer-vis-"+ name +"'><span class='glyphicon glyphicon-eye-open'></span></button>" +
                "<button title='edit properties' type='button' class='btn btn-default btn-xs btn-layer-edit' id='btn-layer-edit-"+ name +"'><span class='glyphicon glyphicon-pencil'></span></button>" +
                "<button title='delete' type='button' class='btn btn-default btn-xs btn-layer-delete' id='btn-layer-delete-"+ name +"'><span class='glyphicon glyphicon-trash'></span></button>" +
                "<button title='move up' type='button' class='btn btn-default btn-xs btn-layer-up' id='btn-layer-up-"+ name +"'><span class='glyphicon glyphicon-chevron-up'></span></button>" +
                "<button title='move down' type='button' class='btn btn-default btn-xs btn-layer-down' id='btn-layer-down-"+ name +"'><span class='glyphicon glyphicon-chevron-down'></span></button>" +
            "</div>" +
        "</div>");
        this.canvas = $("<canvas class='editor-canvas' id='editor-canvas-" + this.name + "'>");
        this.context = this.canvas[0].getContext('2d');
        
        this.ele_content_div.append(this.canvas);
        this.ele_container_div.append(this.ele_content_div);
        this.ele_container_div.append(this.ele_text_div);
        
        this.ele_container_div.css('background-repeat', 'repeat');
        
        $('#editor-viewport').append(this.ele_container_div);
        $('#layer-list').append(this.ele_list_div);
        this.set_z(opts.z);
        this.update_view();
    }
    this.wrapper_layer.prototype.edit = function(name, options) {
        if (name != this.name)
            this.set_name(name);
            
        if (options.fullsize != this.ob.fullsize) {
            this.resize(options);
        } else if (options.width != this.ob.width || options.height != this.ob.height) {
            this.resize(options);
        }
        
        if (options.refresh && this.ob.refresh) {
            this.ob.refresh_rate = options.refresh_rate;
        } else if (this.ob.refresh && !options.refresh) {
            this.ob.refresh = false;
            delete this.ob.refresh_rate;
        } else if (!this.ob.refresh && options.refresh) {
            this.ob.refresh = options.refresh;
            this.ob.refresh_rate = options.refresh_rate;
        }
        
        
        if (options.locked != this.ob.locked) {
            if (!options.locked) {
                delete this.ob.locked;
            } else {
                this.ob.locked = true;
            }
        }
        
        if (options.left != this.ob.left || options.top != this.ob.top)
            this.set_position(options);
        
        if (options.fillsprite && !this.ob.fillsprite) {
            this.ob.fillsprite = true;
            this.ob.fillsprite_name = options.fillsprite_name;
            this.ob.fillsprite_map = this.generate_fillsprite_map();
        }
        
        if (this.ob.fillsprite && !options.fillsprite) {
            delete this.ob.fillsprite;
            delete this.ob.fillsprite_name;
            delete this.ob.fillsprite_map;
        }
        
        if (this.ob.fillsprite && options.fillsprite) {
            if (this.ob.fillsprite_name != options.fillsprite_name) {
                this.ob.fillsprite_name = options.fillsprite_name;
            }
        }
        
        this.update_view();
    }
    this.wrapper_layer.prototype.generate_fillsprite_map = function() {
        return [0, 0, 0, 0, 0, 0, 0];
    }
    this.wrapper_layer.prototype.set_name = function(name) {
        e.file.current_scenario.layers[name] = e.file.current_scenario.layers[this.name];
        delete e.file.current_scenario.layers[this.name];
        this.ob = e.file.current_scenario.layers[name];
        this.name = name;
        this.ele_list_div.attr('id', 'layer-view-' + this.name);
        this.ele_list_div.html("<p class='big-list-item-title' id='title-layer-edit-" + this.name +  "'>" + this.name + "</p>" +
            "<div class='btn-group big-list-item-controls'>" +
                "<button title='show or hide' type='button' class='btn btn-default btn-xs btn-layer-vis' id='btn-layer-vis-"+ this.name +"'><span class='glyphicon glyphicon-eye-open'></span></button>" +
                "<button title='edit properties' type='button' class='btn btn-default btn-xs btn-layer-edit' id='btn-layer-edit-"+ this.name +"'><span class='glyphicon glyphicon-pencil'></span></button>" +
                "<button title='delete' type='button' class='btn btn-default btn-xs btn-layer-delete' id='btn-layer-delete-"+ this.name +"'><span class='glyphicon glyphicon-trash'></span></button>" +
                "<button title='move up' type='button' class='btn btn-default btn-xs btn-layer-up' id='btn-layer-up-"+ this.name +"'><span class='glyphicon glyphicon-chevron-up'></span></button>" +
                "<button title='move down' type='button' class='btn btn-default btn-xs btn-layer-down' id='btn-layer-down-"+ this.name +"'><span class='glyphicon glyphicon-chevron-down'></span></button>" +
            "</div>");
        this.canvas.attr('id', 'editor-canvas-"' + this.name);
        this.ele_container_div.attr('id', 'editor-layer-container-"' + this.name);
        this.ele_content_div.attr('id', 'layer-contents-' + this.name);
        this.ele_text_div.html(this.name);
        
    }
    this.wrapper_layer.prototype.set_visibility = function(visibility) {
        this.visible = visibility;
        if (this.visible) {
            this.ele_content_div.fadeTo(200, 1);
            this.ele_text_div.fadeTo(200, 1);
            this.ele_container_div.addClass('editor-layer-container-visible');
            this.ele_container_div.removeClass('editor-layer-container-hidden');
        } else {
            this.ele_content_div.fadeTo(200, 0);
            this.ele_text_div.fadeTo(200, .15);
            this.ele_container_div.removeClass('editor-layer-container-visible');
            this.ele_container_div.addClass('editor-layer-container-hidden');
        }
    }
    this.wrapper_layer.prototype.update_view = function() {
        var d = this.get_dimensions();
        
        this.canvas.attr('width', d.width);
        this.canvas.attr('height', d.height);
    
        this.ele_content_div.css('height', d.height + 'px');
        this.ele_content_div.css('width', d.width + 'px');
        
        this.ele_container_div.css('left', d.left + 'px');
        this.ele_container_div.css('top', d.top + 'px');
        

       
        if (e.layers.selected_layer === this) {
            this.select();
        }
        
        if (!this.ob.fillsprite) {
            this.ele_container_div.css('background-image', '');
        }
        
        this.set_visibility(this.visible);
    }
    this.wrapper_layer.prototype.set_position = function(pos) {
        this.ob.left = pos.left;
        this.ob.top = pos.top;
        this.update_view();
    }
    this.wrapper_layer.prototype.get_dimensions = function() {
        var d = {}
        if (this.ob.fullsize) {
            d.width = e.viewport.ob.width;
            d.height = e.viewport.ob.height;
            d.left = 0;
            d.top = 0;
        } else {
            d.width = this.ob.width;
            d.height = this.ob.height;
            d.left = this.ob.left;
            d.top = this.ob.top;
        }
        return d;
    }
    this.wrapper_layer.prototype.hide = function() {
        this.ele_container_div.remove();
        this.ele_list_div.remove();
    },
    this.wrapper_layer.prototype.show = function(time) {
        if (time) {
            this.ele_content_div.css('opacity', '0');
            this.ele_text_div.css('opacity', '0');
            $('#editor-viewport').append(this.ele_container_div);
            $('#layer-list').append(this.ele_list_div);
            this.ele_content_div.fadeTo(time, 1);
            this.ele_text_div.fadeTo(time, 1);
            return true;
        }
        $('#editor-viewport').append(this.ele_container_div);
        $('#layer-list').append(this.ele_list_div);
        return true;
    }
    this.wrapper_layer.prototype.set_z = function(order) {
        this.order = order;
        this.ob['z'] = order;
        this.z_order = 100 - this.order;
        this.ele_container_div.css('z-index', this.z_order);
    }
    this.wrapper_layer.prototype.update_list_view = function() {
        $('#layer-list').append(this.ele_list_div);
    }
    this.wrapper_layer.prototype.resize = function(size) {
        if (size.fullsize == undefined || !size.fullsize) {
            if (!this.ob.fullsize) {
                this.ob.width = size.width;
                this.ob.height = size.height;
            }
        } else {
            this.fullsize = true;
            delete this.ob.width;
            delete this.ob.height;
        }
        this.update_view();
    }
    this.wrapper_layer.prototype.set_name = function(new_name) {
        $('#title-layer-edit-' + this.name).html(new_name);
        this.ele_text_div.html(new_name);
        this.ele_container_div.attr('id', 'editor-layer-container-' + new_name);
        this.ele_content_div.attr('id', 'editor-layer-contents-' + new_name);
        $('#layer-view-' + this.name).attr('id', 'layer-view-' + new_name);
        $('#title-layer-edit-' + this.name).attr('id', 'title-layer-edit-' + new_name);
        $('#btn-layer-edit-' + this.name).attr('id', 'btn-layer-edit-' + new_name);
        $('#btn-layer-up-' + this.name).attr('id', 'btn-layer-up-' + new_name);
        $('#btn-layer-down-' + this.name).attr('id', 'btn-layer-down-' + new_name);
        $('#btn-layer-vis-' + this.name).attr('id', 'btn-layer-vis-' + new_name);
        this.name = new_name;
    }
    this.wrapper_layer.prototype.remove = function() {
        this.ele_container_div.remove();
        this.ele_list_div.remove();
        delete e.file.current_scenario.layers[this.name];
        delete this;
    }
    this.wrapper_layer.prototype.select = function() {
        if (this.ob.fillsprite) {
            if (this.grid_img == undefined) {
                var sprite = e.resources.sprites[this.ob.fillsprite_name];
                this.grid_img = e.get_grid(sprite.size.w, sprite.size.h, 'black');
            }
            this.ele_container_div.css('background-image', 'url(' + this.grid_img +')');
        }
    }
    this.wrapper_layer.prototype.deselect = function() {
        this.ele_container_div.css('background-image', '');
    }
    
    this.layers = {
        init: function() {
            this.ob = e.file.current_scenario.layers;
            this.layers = {};
            this.selected_layer = '';
            if (this.ob == undefined) {
                e.file.current_scenario['layers'] = {};
                this.ob = e.file.current_scenario.layers;
            }
            
            this.length = 0;
            
            $('#layer-list').html('');
            
            for (layer in this.ob)
                this.add(layer, this.ob[layer]);
        },
        add: function(name, options) {
            if (!options.z)
                options.z = this.length;
            if (this.layers[name] == undefined) {
                this.layers[name] = new e.wrapper_layer(name, options);
                this.length++;
                return {'added': true};
            }
            return {'added': false, 'error': 'layer name "' + name + '" is already taken'};
        },
        edit: function(old_name, name, options) {
            this.layers[old_name].edit(name, options);
        },
        select: function(name) {
            if (this.layers[name] != undefined) {
                $('#layer-list > .big-list-item-selected').removeClass('big-list-item-selected');
                $('.editor-layer-container-selected').removeClass('editor-layer-container-selected');
                $('.editor-layer-text-selected').removeClass('editor-layer-text-selected');
                $('#editor-layer-container-' + name).addClass('editor-layer-container-selected');
                $('#layer-view-' + name).addClass('big-list-item-selected');
                layer = this.layers[name];
                layer.ele_text_div.addClass('editor-layer-text-selected');
                if (this.selected_layer != '')
                    this.selected_layer.deselect();
                
                this.selected_layer = layer;
                this.selected_layer.select();
            }
        },
        get_order: function() {
            var order = [];
            for (key in this.ob)
                order[this.ob[key].z] = key;
            return order;
        },
        viewport_resized: function() {
            /* update in case the layers are fullsize */
            for (layer in this.layers)
                this.layers[layer].update_view();
        },
        move_up: function(name) {
            var lay = this.layers[name];
            if (lay.order == 0) {
                return false
            } else {
                var above = this.get_layer_at_z(lay.order - 1);
                above.set_z(lay.order);
                lay.set_z(lay.order-1);
                lay.ele_list_div.slideUp(100, function() {
                    lay.ele_list_div.before(above.ele_list_div);
                    lay.ele_list_div.after(above.ele_list_div);
                    lay.ele_list_div.slideDown(100);
                });
            }
        },
        move_down: function(name) {
            var lay = this.layers[name];
            if ((lay.order + 1) == this.length) {
                return false
            } else {
                var below = this.get_layer_at_z(lay.order + 1);
                below.set_z(lay.order);
                lay.set_z(lay.order+1);
                lay.ele_list_div.slideUp(100, function() {
                    lay.ele_list_div.after(below.ele_list_div);
                    lay.ele_list_div.before(below.ele_list_div);
                    lay.ele_list_div.slideDown(100);
                });
            }
        },
        get_layer_at_z: function(z) {
            for (layer in this.layers) {
                if (this.layers[layer].order == z)
                    return this.layers[layer];
            }
        },
        remove_layer: function(name) {
            var lay = this.layers[name];
            var z = lay.ob.z;
            lay.remove();
            delete this.layers[name];
            for (var i = z; i < this.length-1; i++)
                this.get_layer_at_z(i+1).set_z(i);
            this.length--;
        },
        update_list_view: function() {
            $('#layer-list').html('');
            for (layer in this.layers)
                this.layers[layer].update_list_view();
        },
        game_start: function() {
            this.hide_all();
        },
        game_stop: function() {
            this.show_all();
        },
        hide_all: function() {
            for (layer in this.layers)
                this.layers[layer].hide();
        },
        show_all: function() {
            for (layer in this.layers)
                this.layers[layer].show(500);
        }
    }
    
    this.init = function() {
        this.game.init();
        this.viewport.init();
        this.resources.init();
        this.layers.init();
    }
    
    this.file.init(scenario);
    

}

