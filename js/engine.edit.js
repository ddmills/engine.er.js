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
Res_Image = function(name, source) {
    this.name = name;
    this.source = source;
    this.time = new Date().getTime();
    this.img = new Image();
    var me = this;
    this.img.onload = function() {
        window.edit.resources.img_loaded(me);
    }
    this.img.onerror = function() {
        window.edit.resources.img_error(me);
    }
    this.img.src = this.source + '?time=' + this.time;
    this.users = {};
}
Res_Image.prototype.get_json = function() {
    var json = {
        name: this.name,
        source: this.source,
        users: this.users
    }
    return json;
}
Res_Image.prototype.remove = function() {
    $('#res-image-item-' + this.name).remove();
    $('#res-image-' + this.name).remove();
    for (var user in this.users) {
        users[user].notify_img_remove(this);
    }
    delete window.edit.resources.imgs[this.name];
    delete this;
}
Res_Image.prototype.refresh = function() {
    this.time = new Date().getTime();
    this.img.src = this.source + '?time=' + this.time;
}

View_Layer = function(name, overlay, persistant, order, width, height, left, top) {
    this.name = name;
    this.overlay = overlay;
    this.persistant = persistant;
    this.visible = false;
    
    this.height = height;
    this.width = width;
    
    this.x = left;
    this.y = top;
    
    this.ele_container_div = $("<div class='editor-layer-container' id='editor-layer-container-"+this.name+"'></div>");
    this.ele_content_div = $("<div class='editor-layer-contents' id='layer-contents-'"+this.name+"'></div>");
    this.ele_text_div = $("<p class='editor-layer-text'>" + this.name + "</p>");
    this.canvas = $("<canvas class='editor-canvas' id='editor-canvas-" + this.name + "'>");
    
    this.context = this.canvas[0].getContext('2d');
    this.canvas.attr('width', this.width);
    this.canvas.attr('height', this.height);
    
    this.ele_content_div.append(this.canvas);
    
    this.ele_content_div.css('height', this.height + 'px');
    this.ele_content_div.css('width', this.width + 'px');
    
    this.ele_container_div.css('left', this.x + 'px');
    this.ele_container_div.css('top', this.y + 'px');
    
    this.set_order(order);
    
    this.ele_content_div.css('opacity', '0');
    this.ele_text_div.css('opacity', '0');
    
    this.ele_container_div.append(this.ele_content_div);
    this.ele_container_div.append(this.ele_text_div);
    
    $('#editor-viewport').append(this.ele_container_div);
    this.set_visibility(true);
}
View_Layer.prototype.move_up = function() {
    if (this.order != 0) {
        var above = window.edit.layer_order[this.order - 1];
        if (above != undefined) {
            window.edit.swap_layers(this.name, above, above);
            this.z_order = 100 - this.order;
        }
    }
}
View_Layer.prototype.move_down = function() {
    if (this.order != window.edit.layer_order.length - 1) {
        var below = window.edit.layer_order[this.order +1];
        if (below != undefined) {
            window.edit.swap_layers(below, this.name, this.name);
            this.z_order = 100 - this.order;
        }
    }
}
View_Layer.prototype.set_name = function(new_name) {
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
View_Layer.prototype.set_visibility = function(visibility) {
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
View_Layer.prototype.set_order = function(order) {
    this.order = order;
    this.z_order = 100 - this.order;
    this.ele_container_div.css('z-index', this.z_order);
}
View_Layer.prototype.settings = function(name, overlay, persistant, width, height, left, top) {
    this.set_name(name);
    this.overlay = overlay;
    this.persistant = persistant;
    this.width = width;
    this.height = height;
    this.x = left;
    this.y = top;
    
    this.ele_content_div.css('height', this.height + 'px');
    this.ele_content_div.css('width', this.width + 'px');
    
    this.ele_container_div.css('left', this.x + 'px');
    this.ele_container_div.css('top', this.y + 'px');
    
}
View_Layer.prototype.remove = function() {
    this.ele_container_div.remove();
}
View_Layer.prototype.get_json = function() {
    var json = {
        name: this.name,
        overlay: this.overlay,
        persistant : this.persistant,
        height: this.height,
        width: this.width,
        left: this.x,
        top: this.y,
        order: this.order
    }
    
    return json;
}

Component = function(name, type, opts) {
    this.name = name;
    this.type = type;
    
    if (this.type == 'text') {
        this.text = opts.text;
        this.font = opts.font;
        this.size = opts.size;
        this.color = opts.color;
    } else if (this.type == 'none') {
        this.width = opts.edit_width;
        this.height = opts.edit_height;
        this.color = opts.edit_color;
    }
    
    this.users = {};
    console.log(this);
}
Component.prototype.remove = function() {
    console.log('remove me. implement pls')
}
Component.prototype.change_settings = function() {
    console.log('settings. implement pls');
}
Component.prototype.create_instance = function() {
    
}

$(window).ready(function() {
    window.edit = new engine_editor();
    var act_id = $('.active').attr('id');
    $('#shelf-' + act_id.substr(5, act_id.length)).show();
    $('.input-color').simpleColorPicker({ colorsPerLine: 16 });
    wait_for_resize();
    var can = $('#images-thumbs');
    can.attr('width', can.css('width'));
    can.attr('height', can.css('height'));
    $('#comp-add-displaytype').selectpicker();
});

/* number form control */
$(document).on('keyup', '.int-only', function () {
    if (this.value.indexOf('-') == 0) {
        var val = this.value.replace(/[^0-9]/g, '');
        this.value = ('-' + val);
    } else {
        this.value = this.value.replace(/[^0-9]/g, '');
    }
});
$(document).on('keyup', '.pos-int-only', function () { 
    this.value = this.value.replace(/[^0-9]/g,'');
});

/* editor sizing */
var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
$(window).resize(function() {
    delay(function(){
        resize_editor();
    }, 500);
    var can = $('#images-thumbs');
    can.attr('width', can.css('width'));
    can.attr('height', can.css('height'));
});
wait_for_resize = function() {
    if ($('#area-left').css('height') == '0px') {
        setTimeout(wait_for_resize, .2);
    } else {
        window.edit.viewport.add_viewport(640, 480);
        resize_editor();
    }
};
resize_editor = function() {
    var area_w = $('#area-left').width();
    var area_h = $('#area-left').height();
    
    var view_w = parseInt(window.edit.viewport.width); 
    var view_h = parseInt(window.edit.viewport.height);
    
    var most_left = 0
    var most_right = view_w;
    var most_top = 0
    var most_bottom = view_h;

    
    for (layer in window.edit.layers) {
        var layer = window.edit.layers[layer];
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

/* alerts */
$(document).on('DOMSubtreeModified', '.alert-area', function(e) {
    var child = $(this).children();
    setTimeout(function() {
        child.slideUp(200);
    }, 4000);
});
add_alert = function(message, type, id) {
    var ele = $("<div class='alert alert-" + type + "'>" + message + "</div>");
    ele.hide();
    $('#' + id + '-notify').append(ele);
    ele.show(500);
}

/* settings */
$(document).on('click', '#btn-settings-grid', function() {
    $('#shelf-settings-all').hide(200);
    $('#shelf-settings-grid').show(200);
});
/* settings : grid */
$(document).on('click', '#grid-settings-confirm', function() {
    var w = $('#settings-grid-width').val();
    var h = $('#settings-grid-height').val();
    var c = $('#settings-grid-color').val();
    window.edit.viewport.grid_w = w;
    window.edit.viewport.grid_h = h;
    window.edit.viewport.grid_color = c;
    draw_grid(w, h, c);
    var html = "<div class='alert alert-success alert-dismissable'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
        "grid settings changed" +
    "</div>";
    $('#settings-all-notify').html(html);
    $('#shelf-settings-grid').hide(200);
    $('#shelf-settings-all').show(200);
});
$(document).on('click', '#btn-settings-grid-back', function() {
    $('#settings-grid-width').val();
    $('#settings-grid-height').val();
    $('#settings-grid-color').val();
    $('#settings-bkg-color').val();
    $('#shelf-settings-grid').hide(200);
    $('#shelf-settings-all').show(200);
});
$(document).on('click', '#grid-settings-cancel', function() {
    $('#settings-grid-width').val();
    $('#settings-grid-height').val();
    $('#settings-grid-color').val();
    $('#settings-bkg-color').val();
    $('#shelf-settings-grid').hide(200);
    $('#shelf-settings-all').show(200);
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
    $('#editor-viewport').css('background-image', 'url(' + dataURL +')');
}

/* nav tabs */
$(document).on('click', '.navtab', function() {
    if (!$(this).hasClass('active')) {
        var old_id = $('.active').attr('id');
        var old = old_id.substr(5, old_id.length);
        $('.active').removeClass('active');
        
        $(this).addClass('active');
        var cur_id = $(this).attr('id');
        var cur = cur_id.substr(5, cur_id.length);
        $('#shelf-' + old).hide(200);
        $('#shelf-' + cur).show(200);
    }
});

/* layers */
$(document).on('click', '.btn-layer-edit', function() {
    var id = $(this).attr('id');
    var name = id.substr(15, id.length);
    layer_edit_form_set(name);
    $('#shelf-layer-view').hide(200);
    $('#shelf-layer-edit').show(200);
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
    $('#shelf-layer-view').hide(200);
    layer_add_form_clear();
    $('#shelf-layer-add').show(200);
});
$(document).on('click', '#layer-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    window.edit.select_layer(name);
});
/* layers : add */
layer_add_form_clear = function() {
    $('#layer-add-form-name').val('layer_' + window.edit.layer_order.length);
    $('#layer-add-form-width').val('640');
    $('#layer-add-form-height').val('480');
    $('#layer-add-form-left').val('0');
    $('#layer-add-form-top').val('0');
    $('span', $('#uniform-layer-add-form-overlay')).removeClass('checked');
    $('span', $('#uniform-layer-add-form-persistant')).removeClass('checked');
    $('#layer-add-form-overlay').removeAttr('checked');
    $('#layer-add-form-persistant').removeAttr('checked');
    $('#layer-add-err').html('');
}
$(document).on('click', '#add-layer-cancel', function() {
   $('#shelf-layer-add').hide(200);
   $('#shelf-layer-view').show(200);
});
$(document).on('click', '#btn-layer-add-back', function() {
   $('#shelf-layer-add').hide(200);
   $('#shelf-layer-view').show(200);
});
$(document).on('click', '#add-layer-confirm', function() {
    var name = $('#layer-add-form-name').val();
    var overlay = $('#layer-add-form-overlay').prop('checked');
    var persistant =$('#layer-add-form-persistant').prop('checked');
    var width = $('#layer-add-form-width').val();
    var height = $('#layer-add-form-height').val();
    var left = $('#layer-add-form-left').val();
    var top = $('#layer-add-form-top').val();
    
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
    } else if (window.edit.add_layer(name, overlay, persistant, width, height, left, top)) {
        var html = "<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "layer " + name + " created" +
        "</div>";
        $('#layer-view-notify').html(html);
        $('#shelf-layer-add').hide(200);
        $('#shelf-layer-view').show(200);
    } else {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "a layer already exists with that name" +
        "</div>";
        $('#layer-add-err').html(html);
    }
});
/* layers : edit */
layer_edit_form_set = function(name) {
    var lay = window.edit.layers[name];
    $('#layer-edit-form-title').html("<span class='glyphicon glyphicon-file'></span>edit layer: " + name);
    $('#layer-edit-form-name').val(name);
    $('#layer-edit-form-width').val(lay.width);
    $('#layer-edit-form-height').val(lay.height);
    $('#layer-edit-form-left').val(lay.x);
    $('#layer-edit-form-top').val(lay.y);
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
    $('#shelf-layer-edit').hide(200);
    $('#layer-view-notify').html('');
    $('#shelf-layer-view').show(200);
});
$(document).on('click', '#btn-layer-edit-back', function() {
    $('#shelf-layer-edit').hide(200);
    $('#layer-view-notify').html('');
    $('#shelf-layer-view').show(200);
});
$(document).on('click', '#edit-layer-confirm', function() {
    var old_name = $('#layer-edit-form-name').data('lay_name');
    var name = $('#layer-edit-form-name').val();
    var overlay = $('#layer-edit-form-overlay').prop('checked');
    var persistant =$('#layer-edit-form-persistant').prop('checked');
    var width = $('#layer-edit-form-width').val();
    var height = $('#layer-edit-form-height').val();
    var left = $('#layer-edit-form-left').val();
    var top = $('#layer-edit-form-top').val();
    if (name == '') {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "the layer requires a name" +
        "</div>";
        $('#layer-edit-err').html(html);
        return false;
    } else if (name.indexOf(' ') != -1) {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "the layer name cannot contain spaces" +
        "</div>";
        $('#layer-edit-err').html(html);
    } else if (window.edit.layers[name] == undefined) {
        var layer = window.edit.layers[old_name];
        window.edit.layers[name] = layer;
        delete window.edit.layers[old_name];
        layer.settings(name, persistant, overlay, width, height, left, top);
        resize_editor();
        window.edit.layer_order[layer.order] = name;
        var html = "<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "layer " + name + " updated" +
        "</div>";
        $('#layer-view-notify').html(html);
        $('#shelf-layer-edit').hide(200);
        $('#shelf-layer-view').show(200);
        return true;
    } else if (name != old_name) {
        var html = "<div class='alert alert-danger alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "a layer already exists with that name" +
            "</div>";
        $('#layer-edit-err').html(html);
        return false;
    } else {
        window.edit.layers[old_name].settings(name, persistant, overlay, width, height, left, top);
        resize_editor();
        var html = "<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "layer " + name + " updated" +
        "</div>";
        $('#layer-view-notify').html(html);
        $('#shelf-layer-edit').hide(200);
        $('#shelf-layer-view').show(200);
        return true;
    }
});

/* resources */
$(document).on('click', '#btn-resources-images', function() {
    $('#shelf-resources-all').hide(200);
    $('#shelf-resources-images').show(200);
});
$(document).on('click', '#btn-resources-sprites', function() {
    $('#shelf-resources-all').hide(200);
    $('#shelf-resources-sprites').show(200);
});
$(document).on('click', '#btn-resources-images-back', function() {
    $('#shelf-resources-images').hide(200);
    $('#shelf-resources-all').show(200);
});
$(document).on('click', '#btn-resources-sprites-back', function() {
    $('#shelf-resources-sprites').hide(200);
    $('#shelf-resources-all').show(200);
});
/* resources : images */
$(document).on('click', '#image-add-confirm', function() {
    var source = $('#image-add-path').val()
    var name = $('#image-add-name').val()
    window.edit.resources.add_img(name, source);
});
$(document).on('click', '#res-images-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    $('#res-images-list > .big-list-item-selected').removeClass('big-list-item-selected');
    $(this).addClass('big-list-item-selected');
    window.edit.resources.draw_thumb(name);
});
$(document).on('click', '.btn-img-delete', function() {
    var id = $(this).attr('id');
    var name = id.substr(17, id.length);
    window.edit.resources.remove_img(name);
});
$(document).on('click', '.btn-img-refresh', function() {
    var id = $(this).attr('id');
    var name = id.substr(18, id.length);
    window.edit.resources.refresh_img(name);
});

/* components */
component_add_form_clear = function() {
    $('#comp-add-name').val('');
    
    $('#comp-add-image-res').val('');
    $('#comp-add-image-width').val('32');
    $('#comp-add-image-height').val('32');
    
    $('#comp-add-text-text').val('sometext');
    $('#comp-add-text-font').val('lucidia-console');
    $('#comp-add-text-size').val('10');
    $('#comp-add-text-color').val('white');
    
    $('#comp-add-none-width').val('32');
    $('#comp-add-none-height').val('32');
    $('#comp-add-none-editcolor').val('blue');

}
$(document).on('click', '#btn-component-add', function() {
    $('#shelf-components-all').hide(200);
    component_add_form_clear();
    var type= $('#comp-add-displaytype').val(); 
    $('#comp-add-displaytype-' + type + '-options').addClass('comp-disptype-selected');
    $('#shelf-components-add').show(200);
});
$(document).on('click', '#component-add-cancel', function() {
    $('#shelf-components-all').show(200);
    $('#shelf-components-create').hide(200);
});
$(document).on('click', '#btn-component-add-back', function() {
    $('#shelf-components-all').show(200);
    $('#shelf-components-create').hide(200);
});
$(document).on('change', '#comp-add-displaytype', function() {
    var type= $('#comp-add-displaytype').val(); 
    $('.comp-disptype-selected').removeClass('comp-disptype-selected');
    $('#comp-add-displaytype-' + type + '-options').addClass('comp-disptype-selected');

});
$(document).on('click', '#component-add-confirm', function() {
    var name = $('#comp-add-name').val();
    var type = $('#comp-add-displaytype').val();
    var opts = {};
    
    if (type == 'sprite') {
        opts.sprite_name = $('#comp-add-sprite-res').val();
    } else if (type == 'image') {
        opts.img_name = $('#comp-add-image-res').val();
    } else if (type == 'text') {
        opts.text = $('#comp-add-text-text').val();
        opts.font = $('#comp-add-text-font').val();
        opts.size = $('#comp-add-text-size').val();
        opts.color = $('#comp-add-text-color').val();
    } else if (type == 'none') {
        opts.edit_width = $('#comp-add-none-width').val();
        opts.edit_height = $('#comp-add-none-height').val();
        opts.edit_color = $('#comp-add-none-editcolor').val();
    }
    
    if (name == '') {
        add_alert('name cannot be blank', 'danger', 'components-add');
    }
    
    if (window.edit.components.add_component(name, type, opts)) {
        $('#shelf-components-add').hide(200);
        add_alert('component "' + name + '" successfully added', 'success', 'components-all');
        $('#shelf-components-all').show(200);
    } else {
        add_alert('component "' + name + '" already exists', 'danger', 'components-add');
    }

});
$(document).on('click', '#component-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    $('#component-list > .big-list-item-selected').removeClass('big-list-item-selected');
    $(this).addClass('big-list-item-selected');
});

/* load and save */
$(document).on('click', '#btn-save', function() {
    $('#save-modal').modal('show');
});
$(document).on('click', '#btn-file-open', function() {
    var id = $('.list-file-item-selected').attr('id');
    if (id != undefined) {
        var selected = id.substr(10, id.length);
        $('#open-modal').modal('hide');
        window.edit.files.load_file(selected);
    } else {
        console.log('select a file...');
    }
});
$(document).on('click', '#btn-load', function() {
    var keys = window.edit.files.get_files();
    $('#file-open-list').html('');
    for (var index in keys) {
        var key = keys[index];
        var ele = $("<li class='list-group-item list-file-item' id='open-file-" + key +"'>" + key + "</li>");
        $('#file-open-list').append(ele);
    }
});
$(document).on('click', '.list-file-item', function() {
    $('.list-file-item-selected').removeClass('list-file-item-selected');
    $(this).addClass('list-file-item-selected');
});
$(document).on('click', '#btn-save', function() {
    console.log(window.edit.files.storage);
    if (window.edit.files.current_file != '') {
        window.edit.files.save();
    } else {
        var name = $('#saveas-file-name').val();
        $('#saveas-modal').modal('show');
    }
});
$(document).on('click', '#btn-file-saveas', function() {
    var name = $('#saveas-file-name').val();
    console.log('saving ' + name);
    window.edit.files.save_as(name);
});

/* viewport */
$(document).on('click', '#viewport-confirm', function() {
    var w = $('#viewport-width').val();
    var h = $('#viewport-height').val();
    var c = $('#viewport-bkg-color').val();
    window.edit.viewport.set_props(w, h, c);
    var ele = $("<div class='alert alert-success alert-dismissable'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" +
            "viewport updated" +
        "</div>");
    $('#viewport-notify').append(ele);
});
$(document).on('click', '#viewport-cancel', function() {
    var w = $('#viewport-width').val(window.edit.viewport.width);
    var h = $('#viewport-height').val(window.edit.viewport.height);
    var c = $('#viewport-bkg-color').val(window.edit.viewport.background_color);
});

/* manager */
engine_editor = function() {
    
    this.selected_layer = null;
    this.layers = {};
    this.layer_order = [];
    this.get_json = function() {
        var json = {};
        json.layers = {};
        for(layer in this.layers) {
            json.layers[layer] = this.layers[layer].get_json();
        }
        json.resources = {};
        json.resources.images = {};
        for (img in this.resources.imgs) {
            json.resources.images[img] = this.resources.imgs[img].get_json();
        }
        json.viewport = this.viewport.get_json();
        return json;
    }
    this.add_layer = function(name, overlay, persistant, width, height, left, top) {
        if (this.layers[name]) {
            return false;
        } else {
            var html = "<div class='big-list-item layer-item' id='layer-view-" + name + "'>" +
                "<p class='big-list-item-title' id='title-layer-edit-" + name +  "'>" + name + "</p>" +
                "<div class='btn-group big-list-item-controls'>" +
                    "<button title='show or hide' type='button' class='btn btn-default btn-xs btn-layer-vis' id='btn-layer-vis-"+ name +"'><span class='glyphicon glyphicon-eye-open'></span></button>" +
                    "<button title='edit properties' type='button' class='btn btn-default btn-xs btn-layer-edit' id='btn-layer-edit-"+ name +"'><span class='glyphicon glyphicon-pencil'></span></button>" +
                    "<button title='delete' type='button' class='btn btn-default btn-xs btn-layer-delete' id='btn-layer-delete-"+ name +"'><span class='glyphicon glyphicon-trash'></span></button>" +
                    "<button title='move up' type='button' class='btn btn-default btn-xs btn-layer-up' id='btn-layer-up-"+ name +"'><span class='glyphicon glyphicon-chevron-up'></span></button>" +
                    "<button title='move down' type='button' class='btn btn-default btn-xs btn-layer-down' id='btn-layer-down-"+ name +"'><span class='glyphicon glyphicon-chevron-down'></span></button>" +
                "</div>" +
            "</div>";
            this.layers[name] = new View_Layer(name, overlay, persistant, this.layer_order.length, width, height, left, top);
            this.layer_order.push(name);
            $('#layer-list').append(html);
            this.select_layer(name);
            resize_editor();
            add_alert('layer "'+ name +'" added', 'success', 'layer-view');
            return true;
        }
    }
    this.remove_layer = function(name) {
        $('#layer-view-' + name).remove();
        this.layers[name].remove();
        delete this.layer_order[this.layers[name].order];
        delete this.layers[name];
        this.layer_order = this.layer_order.filter(function (item) { return item != undefined });
        for (var i = 0; i < this.layer_order.length; i++) {
            this.layers[this.layer_order[i]].order = i;
            
        }
        resize_editor();
    }
    this.swap_layers = function(name_1, name_2, collapse) {
        var l1 = this.layers[name_1];
        var l2 = this.layers[name_2];
        
        var tmp = l1.order;
        l1.set_order(l2.order);
        l2.set_order(tmp);
        
        this.layer_order[l1.order] = name_1;
        this.layer_order[l2.order] = name_2;
        
        var e1 = $('#layer-view-' + name_1);
        var e2 = $('#layer-view-' + name_2);

            e1.before(e2);
            e1.after(e2);
    }
    this.select_layer = function(name) {
        if (this.layers[name] != undefined) {
            $('#layer-list > .big-list-item-selected').removeClass('big-list-item-selected');
            $('.editor-layer-container-selected').removeClass('editor-layer-container-selected');
            $('.editor-layer-text-selected').removeClass('editor-layer-text-selected');
            $('#editor-layer-container-' + name).addClass('editor-layer-container-selected');
            $('#layer-view-' + name).addClass('big-list-item-selected');
            layer = this.layers[name].ele_text_div.addClass('editor-layer-text-selected');
            this.selected_layer = layer;
        } else {
            this.selected_layer = null;
        }
    }
    this.viewport = {
        left: 0,
        top: 0,
        width : 640,
        height : 480,
        show_grid : true,
        grid_color : '#1A1A1A',
        grid_w: 16,
        grid_h: 16,
        background_color : 'black',
        set_props : function(w, h, c) {
            this.width = w;
            this.height = h;
            this.background_color = c;
            $('#editor-viewport').css('width', this.width);
            $('#editor-viewport').css('height', this.height);
            $('#editor-viewport').css('background', this.background_color);
            draw_grid(this.grid_w, this.grid_h, this.grid_color);
            resize_editor();
        },
        add_viewport : function(w, h) {
            var ele = $("<div id='editor-viewport'></div>");
            this.width = w;
            this.height = h;
            ele.css('width', this.width);
            ele.css('height', this.height);
            ele.css('background', this.background_color);
            ele.css('opacity', 0);
            $('#editor').html('');
            $('#editor').append(ele);
            ele.fadeTo(1000, 1);
            draw_grid(this.grid_w, this.grid_h, this.grid_color);
        },
        get_json: function() {
            var json = {
                left: 0,
                top: 0,
                width: this.width,
                height: this.height,
                show_grid: this.show_grid,
                grid_color: this.grid_color,
                grid_width: this.grid_w,
                grid_height: this.grid_h,
                background_color: this.background_color
            }
            return json;
        }
    }
    this.resources = {
        imgs: {},
        thumb_can: $('#image-thumb'),
        add_img: function(name, source) {
            if (this.imgs[name] == undefined) {
                new Res_Image(name, source);
            } else {
                add_alert('there is already an image named "'+ img.name +'"', 'danger', 'resources-images');
            }
        },
        remove_img: function(name) {
            if (this.imgs[name]) {
                this.imgs[name].remove();
                add_alert('image "'+ img.name +'" removed', 'success', 'resources-images');
            }
            console.log(this.imgs);
        },
        refresh_img: function(name) {
            if (this.imgs[name]) {
                this.imgs[name].refresh();
            }
        },
        img_loaded: function(img) {
            if (this.imgs[img.name]) {
                add_alert('image "'+ img.name +'" reloaded successfully', 'success', 'resources-images');
                this.draw_thumb(img.name);
            } else {
                var name = img.name;
                add_alert('image "'+ img.name +'" loaded successfully', 'success', 'resources-images');
                this.imgs[name] = img;
                var opt = $("<div class='big-list-item' id='res-image-item-" + name + "'>" +
                    "<p class='big-list-item-title' id='title-res-image-" + name +  "'>" + name + "</p>" +
                    "<div class='btn-group big-list-item-controls'>" +
                    "<button title='delete' class='btn btn-default btn-xs btn-img-delete' id='btn-image-delete-" + name + "'><span class='glyphicon glyphicon-trash'></span></button>" +
                    "<button title='refresh' class='btn btn-default btn-xs btn-img-refresh' id='btn-image-refresh-" + name + "'><span class='glyphicon glyphicon-refresh'></span></button>" +
                    "</div></div>");
                $('#res-images-list').append(opt);
                $('#images-thumbs').show(500);
                
                var ele = $("<option id='res-img-" + name + "' value='res-img-" + name+"'>" + name + "</option>");
                $('#comp-add-image-res').append(ele);
                
                this.draw_thumb(name);
            }
        },
        img_error: function(img) {
            add_alert('image "'+ img.name +'" failed to load', 'danger', 'resources-images');
        },
        draw_thumb : function(name) {
            if(this.imgs[name] != undefined) {
                var img = this.imgs[name].img;
                var ctx = this.thumb_can[0].getContext('2d');
                var w = parseInt(this.thumb_can.css('width'));
                var h = parseInt(this.thumb_can.css('height'));
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0);
            }
        }
    }
    this.components = {
        comps: {},
        add_component : function(name, type, options) {
            if (this.comps[name] == undefined) {
                this.comps[name] = new Component(name, type, options);
                var opt = $("<div class='big-list-item' id='comp-item-" + name + "'>" +
                    "<p class='big-list-item-title' id='comp-item-" + name +  "'>" + name + "</p>" +
                    "<div class='btn-group big-list-item-controls'>" +
                    "<button title='delete' class='btn btn-default btn-xs btn-img-delete' id='btn-comp-delete-" + name + "'><span class='glyphicon glyphicon-trash'></span></button>" +
                    "</div></div>");
                    $('#component-list').append(opt);
                    return true;
            } else {
                
                return false;
            }
        }
    }
    this.files = {
        current_file : '',
        storage: window.localStorage,
        save_as: function(filename) {
            if (this.storage[filename]) {
                console.log('filename already taken!!');
                return false;
            } else {
                var json = JSON.stringify(window.edit.get_json());
                return this.storage.setItem(filename, json);
            }
        },
        save: function() {
            if (this.current_file != '') {
                var json = JSON.stringify(window.edit.get_json());
                return this.storage.setItem(this.current_file, json);
            } else {
                return false;
            }
        },
        get_files: function() {
            var keys = [];
            for (var i = 0; i < this.storage.length; i++) {
                keys.push(this.storage.key(i));
            }
            return keys;
        },
        load_file: function(key) {
            console.log('loading file...' + key);
            var json = this.storage.getItem(key);
            if (json == undefined) {
                console.log('oh no something broke...');
            } else {
                this.parse_json(json);
                this.current_file = key;
                $('#header-filename').html(key);
            }
        },
        parse_json: function(json) {
            var data = JSON.parse(json);
            window.edit.viewport.grid_color = data.viewport.grid_color;
            window.edit.viewport.left = data.viewport.left,
            window.edit.viewport.top = data.viewport.top
            window.edit.viewport.grid_w = data.viewport.grid_width;
            window.edit.viewport.grid_h = data.viewport.grid_height;
            window.edit.viewport.set_props(data.viewport.width, data.viewport.height, data.viewport.background_color);
            for (layer in data.layers) {
                var lay = data.layers[layer];
                window.edit.add_layer(lay.name, lay.overlay, lay.persistant, lay.width, lay.height, lay.left, lay.top);
            }
            for (img in data.resources.images) {
                var image = data.resources.images[img];
                window.edit.resources.add_img(image.name, image.source);
            }
        },
        delete_file: function(key) {
            
        }
        
    }
}