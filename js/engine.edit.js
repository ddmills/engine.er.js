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
                e.viewport.init();
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
            e.viewport.init();
        },
        /* saves a scenario with a given name */
        save_scenario : function(name) {
            if (name == undefined) {
                name = this.current_file;
            }
            this.storage.setItem('__scenarios_' + name, this.get_json(this.current_scenario));
            this.storage.setItem('__editor___previous', name);
            $('#header-filename').html(this.current_file);
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
    this.viewport = {
        init: function() {
            this.grid_width = 16;
            this.grid_height = 16;
            this.grid_color = '#1A1A1A';
            this.ob = e.file.current_scenario.viewport;
            $('#editor').html('');
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
        },
        set_background: function(background) {
            this.ob.background = background;
            this.reset_view();
        },
        draw_grid : function() {
            var can = $('#canvas-create-grid');
            var ctx = can[0].getContext('2d');
            can.attr('width', this.grid_width);
            can.attr('height', this.grid_height);
            ctx.strokeStyle = this.grid_color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.grid_width, 0);
            ctx.lineTo(this.grid_width, this.grid_height);
            ctx.lineTo(0, this.grid_height);
            ctx.stroke();
            var dataURL = can[0].toDataURL();
            this.ele.css('background-image', 'url(' + dataURL +')');
        },
        reset_view: function(fade) {
            if (fade)
                this.ele.css('opacity', 0);
            this.ele.css('width', this.ob.width);
            this.ele.css('height', this.ob.height);
            this.ele.css('background', this.ob.background);
            this.draw_grid();
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
            this.g = null;
            this.running = false;
            this.ele = undefined;
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
                this.ele = $("<div id='editor-viewport-game'></div>");
                $('#editor-viewport').css('background-image', 'none');
                $('#editor-viewport').append(this.ele);
                this.g = new eng(this.ele, e.file.current_scenario);
                this.start = new Date().getTime();
                this.g.initialize(this.game_ready);
                this.running = true;
            }
        },
        game_ready: function() {
            if (e.game.running) {
                var end = new Date().getTime();
                $('#game-fps').show(100);
                $('#game-time').show(100);
                $('#lbl-game-status').html('loaded in ' + (end - e.game.start)/1000 + ' seconds');
            }
        },
        game_stop: function() {
            if (this.running) {
                e.viewport.reset_view(false);
                this.g = null;
                $('#area-game-shelf').hide(250);
                $('#area-editing-shelf').show(500);
                $('#game-fps').hide();
                $('#game-time').hide();
                $('#lbl-game-status').html('loading...');
                $('#btn-loadjson').prop('disabled', false);
                $('#btn-savejson').prop('disabled', false);
                $('#btn-load').prop('disabled', false);
                $('#btn-saveas').prop('disabled', false);
                $('#btn-save').prop('disabled', false);
                $('#btn-new').prop('disabled', false);
                this.running = false;
            }
        }
    }

    this.file.init(scenario);
    this.game.init();
    this.viewport.init();

}

