if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {   
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                res.push(val);
            }
        }

        return res;
    };
}
View_Layer = function(name, overlay, persistant, order, width, height) {
    this.name = name;
    this.overlay = overlay;
    this.persistant = persistant;
    this.order = order;
    this.visible = true;
    
    this.height = height;
    this.width = width;
    
    this.x = 100;
    this.y = 100;
    
    this.ele_container_div = $("<div class='editor-layer-container' id='editor-layer-container-"+this.name+"'><p class='editor-layer-text'>" + this.name + "</div>");
    this.ele_content_div = $("<div class='editor-layer-contents' id='layer-contents-'"+this.name+"'></div>");
    
    this.ele_content_div.css('height', this.height + 'px');
    this.ele_content_div.css('width', this.width + 'px');
    
    this.ele_container_div.css('left', this.x + 'px');
    this.ele_container_div.css('top', this.y + 'px');
    
    this.ele_container_div.append(this.ele_content_div);
    $('#editor-grid').append(this.ele_container_div);
}
View_Layer.prototype.move_up = function() {
    if (this.order != 0) {
        var above = window.edit.layer_order[this.order - 1];
        if (above != undefined) {
            window.edit.swap_layers(this.name, above, above);
        }
    }
}
View_Layer.prototype.move_down = function() {
    console.log(this.order + 1);
    console.log(window.edit.layer_order);
    if (this.order != window.edit.layer_order.length - 1) {
        var below = window.edit.layer_order[this.order +1];
        console.log(this.order);
        console.log(window.edit.layer_order[4]);
        if (below != undefined) {
            window.edit.swap_layers(below, this.name, this.name);
        }
    }
}
View_Layer.prototype.set_name = function(new_name) {
    $('#title-layer-edit-' + this.name).html(new_name);
    $('#layer-view-' + this.name).attr('id', 'layer-view-' + new_name);
    $('#title-layer-edit-' + this.name).attr('id', 'title-layer-edit-' + new_name);
    $('#btn-layer-edit-' + this.name).attr('id', 'btn-layer-edit-' + new_name);
    $('#btn-layer-up-' + this.name).attr('id', 'btn-layer-up-' + new_name);
    $('#btn-layer-down-' + this.name).attr('id', 'btn-layer-down-' + new_name);
    this.name = new_name;
}
View_Layer.prototype.set_visibility = function(visibility) {
    this.visible = visibility;
    console.log('set visibility of layer ' + name + ' to ' + visibility);
}

$(window).ready(function() {
    window.edit = new engine_editor();
    $('#shelf-layer-add').hide();
    $('#shelf-layer-edit').hide();
    $('#shelf-settings-grid').hide();

    var act_id = $('.active').attr('id');
    $('#shelf-' + act_id.substr(5, act_id.length)).show();
    draw_grid(16, 16, '#073763', '#cfe2f3');
    $('.input-color').simpleColorPicker({ colorsPerLine: 16 });
    
    
    for (var i = 0; i < 6; i++) {
       //window.edit.add_layer('layer_' + i, false, false);
    }
});
$(document).on('keyup', '.int-only', function () { 
    this.value = this.value.replace(/[^0-9\.]/g,'');
});

$(document).on('click', '#btn-settings-grid', function() {
    $('#shelf-settings-all').hide();
    $('#shelf-settings-grid').show();
});
$(document).on('click', '#grid-settings-confirm', function() {
    var w = $('#settings-grid-width').val();
    var h = $('#settings-grid-height').val();
    var c = $('#settings-grid-color').val();
    var b = $('#settings-bkg-color').val();
    draw_grid(w, h, c, b);
    var html = "<div class='alert alert-success alert-dismissable'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
        "grid settings changed" +
    "</div>";
    $('#settings-all-notify').html(html);
    $('#shelf-settings-grid').hide();
    $('#shelf-settings-all').show();
});
$(document).on('click', '#grid-settings-cancel', function() {
    $('#settings-grid-width').val();
    $('#settings-grid-height').val();
    $('#settings-grid-color').val();
    $('#settings-bkg-color').val();
    $('#shelf-settings-grid').hide();
    $('#shelf-settings-all').show();
});
draw_grid = function(w, h, grid_color, bkg_color) {
    var can = $('#canvas-create-grid');
    var ctx = can[0].getContext('2d');
    can.attr('width', w);
    can.attr('height', h);
    ctx.strokeStyle = grid_color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.stroke();
    var dataURL = can[0].toDataURL();
    $('#editor-grid').css('background', bkg_color);
    $('#editor-grid').css('background-image', 'url(' + dataURL +')');
    
}

$(document).on('click', '.navtab', function() {
    if (!$(this).hasClass('active')) {
        var old_id = $('.active').attr('id');
        var old = old_id.substr(5, old_id.length);
        $('.active').removeClass('active');
        
        $(this).addClass('active');
        var cur_id = $(this).attr('id');
        var cur = cur_id.substr(5, cur_id.length);
        $('#shelf-' + old).hide(400);
        $('#shelf-' + cur).show(400);
    }
});

$(document).on('click', '.btn-layer-edit', function() {
    var id = $(this).attr('id');
    var name = id.substr(15, id.length);
    layer_edit_form_set(name);
    $('#shelf-layer-view').hide();
    $('#shelf-layer-edit').show();
});
$(document).on('click', '.btn-layer-vis', function() {
    var id = $(this).attr('id');
    var name = id.substr(14, id.length);
    var lay = window.edit.layers[name];
    if (lay.visible) {
        var html = "<span class='glyphicon glyphicon-eye-close'></span>";
        lay.set_visibility(false);
    } else {
        var html = "<span class='glyphicon glyphicon-eye-open'></span>";
        lay.set_visibility(true);
    }
    $(this).html(html);
});
$(document).on('click', '.btn-layer-up', function() {
    var id = $(this).attr('id');
    var name = id.substr(13, id.length);
    window.edit.layers[name].move_up();
});
$(document).on('click', '.btn-layer-down', function() {
    var id = $(this).attr('id');
    var name = id.substr(15, id.length);
    window.edit.layers[name].move_down();
});
$(document).on('click', '.btn-layer-delete', function() {
    var id = $(this).attr('id');
    var name = id.substr(17, id.length);
    var r = confirm('Are you sure you want to delete layer: ' + name + '?');
    
    if (r) {
        window.edit.remove_layer(name);
    }
});
$(document).on('click', '#view-layer-add', function() {
    $('#shelf-layer-view').hide();
    layer_add_form_clear();
    $('#shelf-layer-add').show();
});


$(document).on('click', '.layer-view', function() {
    $('.layer-view-selected').removeClass('layer-view-selected');
    $('.editor-layer-container-selected').removeClass('editor-layer-container-selected');
    
    var name = $(this).children('p').html();
    $('#editor-layer-container-' + name).addClass('editor-layer-container-selected');
    $(this).addClass('layer-view-selected');
});

layer_add_form_clear = function() {
    $('#layer-add-form-name').val('layer_' + window.edit.layer_order.length);
    $('#layer-add-form-width').val('500');
    $('#layer-add-form-height').val('300');
    $('span', $('#uniform-layer-add-form-overlay')).removeClass('checked');
    $('span', $('#uniform-layer-add-form-persistant')).removeClass('checked');
    $('#layer-add-form-overlay').removeAttr('checked');
    $('#layer-add-form-persistant').removeAttr('checked');
    $('#layer-add-err').html('');
}
$(document).on('click', '#add-layer-cancel', function() {
   $('#shelf-layer-add').hide();
   $('#shelf-layer-view').show();
});
$(document).on('click', '#add-layer-confirm', function() {
    var name = $('#layer-add-form-name').val();
    var overlay = $('#layer-add-form-overlay').prop('checked');
    var persistant =$('#layer-add-form-persistant').prop('checked');
    var width = $('#layer-add-form-width').val();
    var height = $('#layer-add-form-height').val();
    if (name == '') {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "the layer requires a name" +
        "</div>";
        $('#layer-add-err').html(html);
    } else if (name.indexOf(' ') != -1) {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "the layer name cannot contain spaces" +
        "</div>";
        $('#layer-add-err').html(html);
    } else if (window.edit.add_layer(name, overlay, persistant, width, height)) {
       $('#shelf-layer-add').hide();
       $('#shelf-layer-view').show();
    } else {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "a layer already exists with that name" +
        "</div>";
        $('#layer-add-err').html(html);
    }
});

layer_edit_form_set = function(name) {
    var lay = window.edit.layers[name];
    $('#layer-edit-form-title').html("<span class='glyphicon glyphicon-file'></span>edit layer: " + name);
    $('#layer-edit-form-name').val(name);
    $('#layer-edit-form-width').val(lay.width);
    $('#layer-edit-form-height').val(lay.height);
    $('#layer-edit-form-name').data('lay_name', name);
    if (lay.overlay) {
        $('span', $('#uniform-layer-edit-form-overlay')).addClass('checked');
        $('#layer-edit-form-overlay').prop('checked', true);
    } else {
        $('span', $('#uniform-layer-edit-form-overlay')).removeClass('checked');
        $('#layer-edit-form-overlay').removeAttr('checked');
    }
    if (lay.persistant) {
        $('span', $('#uniform-layer-edit-form-persistant')).addClass('checked');
        $('#layer-edit-form-persistant').prop('checked', true);
    } else {
        $('span', $('#uniform-layer-edit-form-persistant')).removeClass('checked');
        $('#layer-edit-form-persistant').removeAttr('checked');
    }
    $('#layer-edit-err').html('');
}
layer_edit_form_clear = function() {
    $('#layer-edit-form-title').html("<span class='glyphicon glyphicon-file'></span>Edit Layer: ");
    $('#layer-edit-form-name').val('');
    $('#layer-edit-form-name').data('lay_name', '');
    $('span', $('#uniform-layer-edit-form-overlay')).removeClass('checked');
    $('#layer-edit-form-overlay').removeAttr('checked');
    $('span', $('#uniform-layer-edit-form-persistant')).removeClass('checked');
    $('#layer-edit-form-persistant').removeAttr('checked');
    $('#layer-edit-err').html('');
}
$(document).on('click', '#edit-layer-cancel', function() {
    $('#shelf-layer-edit').hide();
    $('#layer-view-notify').html('');
    $('#shelf-layer-view').show();
});
$(document).on('click', '#edit-layer-confirm', function() {
    var old_name = $('#layer-edit-form-name').data('lay_name');
    var name = $('#layer-edit-form-name').val();
    var overlay = $('#layer-edit-form-overlay').prop('checked');
    var persistant =$('#layer-edit-form-persistant').prop('checked');
    var width = $('#layer-edit-form-width').val();
    var height = $('#layer-edit-form-height').val();
    if (name == '') {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "The layer requires a name." +
        "</div>";
        $('#layer-edit-err').html(html);
        return false;
    } else if (name.indexOf(' ') != -1) {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "The layer name cannot contain spaces." +
        "</div>";
        $('#layer-edit-err').html(html);
    } else if (window.edit.layers[name] == undefined) {
        var layer = window.edit.layers[old_name];
        window.edit.layers[name] = layer;
        layer.set_name(name);
        delete window.edit.layers[old_name];
        layer.overlay = overlay;
        layer.persistant = persistant;
        layer.width = width;
        layer.height = height;
        window.edit.layer_order[layer.order] = name;
        var html = "<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "layer " + name + " updated." +
        "</div>";
        $('#layer-view-notify').html(html);
        $('#shelf-layer-edit').hide();
        $('#shelf-layer-view').show();
        return true;
    } else if (name != old_name) {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "A layer already exists with that name." +
            "</div>";
        $('#layer-edit-err').html(html);
        return false;
    } else {
        window.edit.layers[name].overlay = overlay;
        window.edit.layers[name].persistant = persistant;
        window.edit.layers[name].height = height;
        window.edit.layers[name].width = width;
        var html = "<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "layer " + name + " updated." +
        "</div>";
        $('#layer-view-notify').html(html);
        $('#shelf-layer-edit').hide();
        $('#shelf-layer-view').show();
        return true;
    }
});

engine_editor = function() {
    this.selected_layer = null;
    this.layers = {};
    this.layer_order = [];
    this.add_layer = function(name, overlay, persistant, width, height) {
        if (this.layers[name]) {
            return false;
        } else {
            var html = "<div class='layer-view' id='layer-view-" + name + "'>" +
                "<p class='title-layer-edit' id='title-layer-edit-" + name +  "'>" + name + "</p>" +
                "<div class='btn-group layer-controls'>" +
                    "<button type='button' class='btn btn-default btn-xs btn-layer-vis' id='btn-layer-vis-"+ name +"'><span class='glyphicon glyphicon-eye-open'></span></button>" +
                    "<button type='button' class='btn btn-default btn-xs btn-layer-edit' id='btn-layer-edit-"+ name +"'><span class='glyphicon glyphicon-pencil'></span></button>" +
                    "<button type='button' class='btn btn-default btn-xs btn-layer-delete' id='btn-layer-delete-"+ name +"'><span class='glyphicon glyphicon-trash'></span></button>" +
                    "<button type='button' class='btn btn-default btn-xs btn-layer-up' id='btn-layer-up-"+ name +"'><span class='glyphicon glyphicon-chevron-up'></span></button>" +
                    "<button type='button' class='btn btn-default btn-xs btn-layer-down' id='btn-layer-down-"+ name +"'><span class='glyphicon glyphicon-chevron-down'></span></button>" +
                "</div>" +
            "</div>";
            this.layers[name] = new View_Layer(name, overlay, persistant, this.layer_order.length, width, height);
            this.layer_order.push(name);
            $('#layer-list').append(html);
            return true;
        }
    }
    this.remove_layer = function(name) {
        $('#layer-view-' + name).remove();
        delete this.layer_order[this.layers[name].order];
        delete this.layers[name];
        this.layer_order = this.layer_order.filter(function (item) { return item != undefined });
        for (var i = 0; i < this.layer_order.length; i++) {
            console.log(i + ' ' + this.layer_order[i]);
            this.layers[this.layer_order[i]].order = i;
            
        }
        //console.log(this.layers);
        //console.log(this.layer_order);
    }
    this.swap_layers = function(name_1, name_2, collapse) {
        var l1 = this.layers[name_1];
        var l2 = this.layers[name_2];
        
        var tmp = l1.order;
        l1.order = l2.order;
        l2.order = tmp;
        
        this.layer_order[l1.order] = name_1;
        this.layer_order[l2.order] = name_2;
        
        var e1 = $('#layer-view-' + name_1);
        var e2 = $('#layer-view-' + name_2);

            e1.before(e2);
            e1.after(e2);
    }
    
}

