var edit = null;
$(window).ready(function() {
    
    edit = new editor();
    
    var act_id = $('.active').attr('id');
    $('#shelf-' + act_id.substr(5, act_id.length)).show();
    $('.input-color').simpleColorPicker({ colorsPerLine: 16 });
});

/* utilities */
notify = function(message, type, id) {
    var ele = $("<div class='alert alert-" + type + "'>" + message + "</div>");
    ele.hide();
    $('#' + id + '-notify').append(ele);
    ele.slideDown(200);
    setTimeout(function() {
        ele.slideUp(200);
    }, 4000);
}
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

/* window resizing */
var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
$(window).resize(function() {
    delay(function(){
        edit.resize();
    }, 500);
    var can = $('#images-thumbs');
    can.attr('width', can.css('width'));
    can.attr('height', can.css('height'));
});

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

/* editor window */
var vis = false;
var pan = false;

var pan_start = {x: 0, y: 0};
var editor_start = {x: parseInt($('#editor').css('left')), y: parseInt($('#editor').css('top'))};
var mouse = {x: 0, y: 0};


$(document).mousemove(function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
    
    if (pan) {
        var l = editor_start.x + (mouse.x - pan_start.x);
        var t = editor_start.y + (mouse.y - pan_start.y);
        $('#editor').css('left', l);
        $('#editor').css('top',t);
    }
    
});

$(document).keyup(function(evt) {
    if (evt.keyCode == 32) {
        vis = false;
        $('#editor-modal').hide(25);
    }
});
$(document).keydown(function(evt) {
    if (evt.keyCode == 32) {
        if (vis == false) {
            $('#editor-modal').css('left', mouse.x + 5); 
            $('#editor-modal').css('top', mouse.y - 25)
            $('#editor-modal').show(250);
            vis = true;
        }
    }
});
$(document).mousedown(function(evt) {

    if (evt.which == 3) {
        pan = true;
        pan_start.x = evt.pageX;
        pan_start.y = evt.pageY;
        editor_start = {x: parseInt($('#editor').css('left')), y: parseInt($('#editor').css('top'))};
    }
}).on('contextmenu', function(e){  e.preventDefault(); });;
$(document).mouseup(function(evt) {
    if (evt.which == 3) {
        pan = false;
    }
});
/* file controls */
$(document).on('click', '#btn-save', function() {
    $('#save-modal').modal('show');
});
$(document).on('click', '#btn-file-open', function() {
    var id = $('.list-file-item-selected').attr('id');
    if (id != undefined) {
        var selected = id.substr(10, id.length);
        $('#open-modal').modal('hide');
        if (window.edit.file.load_scenario(selected)) {
            notify('file ' + selected + ' loaded successfully' , 'success', 'editor');
        } else {
            notify('error opening file', 'danger', 'editor');
        }
    } else {
        notify('no file selected', 'danger', 'open-modal');
        console.log('select a file...');
    }
});
$(document).on('click', '#btn-load', function() {
    var keys = edit.file.get_scenarios();
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
    if (edit.file.current_scenario != 'untitled') {
        if (edit.file.save_scenario())
            notify('game saved to localStorage', 'success', 'editor');
    } else {
        var name = $('#saveas-file-name').val();
        $('#saveas-modal').modal('show');
    }
});
$(document).on('click', '#btn-file-saveas', function() {
    var name = $('#saveas-file-name').val();
    if (edit.file.save_scenario(name)) {
        $('#saveas-modal').modal('hide');
        notify('file saved to localStorage', 'success', 'editor');
    }
});
$(document).on('click', '#file-json-load', function() {
    alert('feature isn\'t implemented');
});
$(document).on('click', '#btn-savejson', function() {
    $('#file-json-save-text').val(edit.file.get_json(edit.file.current_scenario, true));
});
$(document).on('click', '#btn-new', function() {
    edit.file.new_scenario();
});

/* game controls*/
$(document).on('click', '#btn-game-test', function() {
    edit.game.game_create();
});
$(document).on('click', '#btn-game-quit', function() {
    edit.game.game_stop();
});
$(document).on('click', '#btn-game-start', function() {
    if (edit.game.game_start())
        notify('game started', 'success', 'editor');
});

/* viewport shelf */
$(document).on('click', '#viewport-confirm', function() {
    var w = $('#viewport-width').val();
    var h = $('#viewport-height').val();
    var c = $('#viewport-bkg-color').val();
    edit.viewport.set_size(w, h);
    edit.viewport.set_background(c);
    notify('viewport updated', 'success', 'viewport');
});
$(document).on('click', '#viewport-cancel', function() {
    $('#viewport-width').val(edit.viewport.ob.width);
    $('#viewport-height').val(edit.viewport.ob.height);
    $('#viewport-bkg-color').val(edit.viewport.ob.background);
});

/* layers shelf */
$(document).on('click', '#view-layer-add', function() {
    $('#shelf-layer-view').hide(200);
    layer_add_form_clear();
    $('#shelf-layer-add').show(200);
});
/* layers : view */
$(document).on('click', '#layer-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    edit.layers.select(name);
});
$(document).on('click', '.btn-layer-vis', function() {
    var id = $(this).attr('id');
    var name = id.substr(14, id.length);
    var lay = edit.layers.layers[name];
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
    edit.layers.move_up(name);
});
$(document).on('click', '.btn-layer-down', function() {
    var id = $(this).attr('id');
    var name = id.substr(15, id.length);
    edit.layers.move_down(name);
});
$(document).on('click', '.btn-layer-delete', function() {
    var id = $(this).attr('id');
    var name = id.substr(17, id.length);
    var r = confirm('Are you sure you want to delete layer: ' + name + '?');
    if (r) {
        edit.layers.remove_layer(name);
    }
});
$(document).on('click', '.btn-layer-edit', function() {
    var id = $(this).attr('id');
    var name = id.substr(15, id.length);
    layer_edit_form_set(name);
    $('#shelf-layer-view').hide(200);
    $('#shelf-layer-edit').show(200);
});
/* layers : add */
layer_add_form_clear = function() {
    $('#layer-add-form-name').val('layer_' + edit.layers.length);

    /* checkboxes */
    $('#layer-add-form-fullsize').removeAttr('checked');
    $('#layer-add-form-refresh').removeAttr('checked');
    $('#layer-add-form-locked').removeAttr('checked');
    $('#layer-add-form-fillsprite').removeAttr('checked');
    
    /* refresh */
    $('#layer-add-form-refreshrate').val('1');
    $('#layer-add-form-group-refresh').hide();
    
    /* size */
    $('#layer-add-form-group-fullsize').show();
    $('#layer-add-form-width').val(edit.viewport.ob.width);
    $('#layer-add-form-height').val(edit.viewport.ob.height);
    $('#layer-add-form-left').val('0');
    $('#layer-add-form-top').val('0');
    
    /* fill */
    $('#layer-add-form-group-fillsprite').hide();
    $('#layer-add-form-fillsprite-sprite').html('');
    for (sprite in edit.resources.sprites) {
        var ele = $('<option value="' + sprite + '">' + sprite + '</option>');
        $('#layer-add-form-fillsprite-sprite').append(ele);
    }
    
    $('#layer-add-notify').html('');
}
$(document).on('change', '#layer-add-form-refresh', function() {
    if (this.checked)
        $('#layer-add-form-group-refresh').show(100);
    else
        $('#layer-add-form-group-refresh').hide(100);
});
$(document).on('change', '#layer-add-form-fullsize', function() {
    if (this.checked)
        $('#layer-add-form-group-fullsize').hide(100);
    else
        $('#layer-add-form-group-fullsize').show(100);
});
$(document).on('change', '#layer-add-form-fillsprite', function() {
    if (this.checked)
        $('#layer-add-form-group-fillsprite').show(100);
    else
        $('#layer-add-form-group-fillsprite').hide(100);
});
$(document).on('click', '#add-layer-confirm', function() {
    var name = $('#layer-add-form-name').val();
    var opts = {};
    opts.fullsize = $('#layer-add-form-fullsize').is(':checked');
    opts.refresh = $('#layer-add-form-refresh').is(':checked');
    opts.locked = $('#layer-add-form-locked').is(':checked');
    opts.fillsprite = $('#layer-add-form-fillsprite').is(':checked');
    
    if (opts.fillsprite)
        opts.fillsprite_name = $('#layer-add-form-fillsprite-sprite').val();
    
    if (opts.refresh)
        opts.refresh_rate = $('#layer-add-form-refreshrate').val();
        
    if (!opts.fullsize) {
        opts.width = $('#layer-add-form-width').val();
        opts.height =$('#layer-add-form-height').val();
        opts.left = $('#layer-add-form-left').val();
        opts.top = $('#layer-add-form-top').val();
    }
    
    opts.z = edit.layers.length;
    
    var result = edit.layers.add(name, opts);
    if (result.added) {
        $('#shelf-layer-add').hide(200);
        $('#shelf-layer-view').show(200, function() {
            notify('layer "' + name + '" added', 'success', 'layer-view');
        });
        
    } else {
        notify(result.error, 'danger', 'layer-add');
    }
});
$(document).on('click', '#btn-layer-add-back', function() {
   $('#shelf-layer-add').hide(200);
   $('#shelf-layer-view').show(200);
});
$(document).on('click', '#add-layer-cancel', function() {
   $('#shelf-layer-add').hide(200);
   $('#shelf-layer-view').show(200);
});
/* layers: edit */
layer_edit_form_set = function(name) {
    var lay = edit.layers.layers[name];
    
    /* name */
    $('#layer-edit-form-name').val(name);
    $('#layer-edit-form-name').data('lay_name', name);
    $('#edit-layer-title-name').html(name);
    
    $('#layer-edit-form-fillsprite-sprite').html('');
    for (sprite in edit.resources.sprites) {
        var ele = $('<option value="' + sprite + '">' + sprite + '</option>');
        $('#layer-edit-form-fillsprite-sprite').append(ele);
    }
    
    /* viewport locked */
    if (lay.ob.locked) {
        $('#layer-edit-form-locked').prop('checked', true);
    } else {
        $('#layer-edit-form-locked').removeAttr('checked');
    }
    
    /* fillsprite */
    if (lay.ob.fillsprite) {
        $('#layer-edit-form-fillsprite').prop('checked', true);
        $('#layer-edit-form-group-fillsprite').show();
        $('#layer-edit-form-fillsprite-sprite option[value="' + lay.ob.fillsprite_name + '"]').attr('selected', 'selected');
    } else {
         $('#layer-edit-form-fillsprite').removeAttr('checked');
        $('#layer-edit-form-group-fillsprite').hide();
    }
    
    /* refresh */
    if (lay.ob.refresh) {
        $('#layer-edit-form-refresh').prop('checked', true);
        $('#layer-edit-form-refreshrate').val(lay.ob.refresh_rate);
        $('#layer-edit-form-group-refresh').show();
    } else {
        $('#layer-edit-form-refresh').removeAttr('checked');
        $('#layer-edit-form-refreshrate').val('1');
        $('#layer-edit-form-group-refresh').hide();
    }
    
    /* size */
    if (lay.ob.fullsize) {
        $('#layer-edit-form-group-fullsize').hide();
        $('#layer-edit-form-fullsize').prop('checked', true);
    } else {
        $('#layer-edit-form-group-fullsize').show();
        $('#layer-edit-form-fullsize').removeAttr('checked');
        $('#layer-edit-form-width').val(lay.ob.width);
        $('#layer-edit-form-height').val(lay.ob.height);
        $('#layer-edit-form-left').val(lay.ob.left);
        $('#layer-edit-form-top').val(lay.ob.top);
    }

    $('#layer-edit-notify').html('');
    
}
$(document).on('click', '#btn-layer-edit-back', function() {
    $('#shelf-layer-edit').hide(200);
    $('#shelf-layer-view').show(200);
});
$(document).on('change', '#layer-edit-form-refresh', function() {
    if (this.checked)
        $('#layer-edit-form-group-refresh').show(100);
    else
        $('#layer-edit-form-group-refresh').hide(100);
});
$(document).on('change', '#layer-edit-form-fullsize', function() {
    if (this.checked)
        $('#layer-edit-form-group-fullsize').hide(100);
    else
        $('#layer-edit-form-group-fullsize').show(100);
});
$(document).on('change', '#layer-edit-form-fillsprite', function() {
    if (this.checked)
        $('#layer-edit-form-group-fillsprite').show(100);
    else
        $('#layer-edit-form-group-fillsprite').hide(100);
});
$(document).on('click', '#edit-layer-cancel', function() {
   $('#shelf-layer-edit').hide(200);
   $('#shelf-layer-view').show(200);
});
$(document).on('click', '#edit-layer-confirm', function() {
   $('#shelf-layer-edit').hide(200);
   
    var name = $('#layer-edit-form-name').val();
    var old_name = $('#layer-edit-form-name').data('lay_name');
   
   var opts = {};
    opts.fullsize = $('#layer-edit-form-fullsize').is(':checked');
    opts.refresh = $('#layer-edit-form-refresh').is(':checked');
    opts.locked = $('#layer-edit-form-locked').is(':checked');
    opts.fillsprite = $('#layer-edit-form-fillsprite').is(':checked');
    
    if (opts.fillsprite)
        opts.fillsprite_name = $('#layer-edit-form-fillsprite-sprite').val();
    
    if (opts.refresh)
        opts.refresh_rate = $('#layer-edit-form-refreshrate').val();
        
    if (!opts.fullsize) {
        opts.width = $('#layer-edit-form-width').val();
        opts.height =$('#layer-edit-form-height').val();
        opts.left = $('#layer-edit-form-left').val();
        opts.top = $('#layer-edit-form-top').val();
    }
    
    opts.z = edit.layers.length;
    
    edit.layers.edit(old_name, name, opts);

    $('#shelf-layer-edit').hide(200);
    $('#shelf-layer-view').show(200, function() {
        notify('layer "' + name + '" edited', 'success', 'layer-view');
    });

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

/* resources: images */
draw_img_thumb = function(name) {
    var imgob = edit.resources.images[name];
    if (imgob != undefined) {
        var img = imgob.img;
        var thumb_can = $('#image-thumb');
        var ctx = thumb_can[0].getContext('2d');
        var w = parseInt(thumb_can.css('width'));
        var h = parseInt(thumb_can.css('height'));
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
    }
}
clear_img_thumb = function() {
    var thumb_can = $('#image-thumb');
    var ctx = thumb_can[0].getContext('2d');
    var w = parseInt(thumb_can.css('width'));
    var h = parseInt(thumb_can.css('height'));
    ctx.clearRect(0, 0, w, h);
}
$(document).on('click', '#btn-resources-images-back', function() {
    $('#shelf-resources-images').hide(200);
    $('#shelf-resources-all').show(200);
});
$(document).on('click', '#image-add-confirm', function() {
    var source = $('#image-add-path').val()
    var name = $('#image-add-name').val()
    edit.resources.add_img(name, {source: source}, function(success, err) {
        if (success) {
            notify('image "'+ name +'" added', 'success', 'resources-images');
            $('#res-images-list > .big-list-item-selected').removeClass('big-list-item-selected');
            $('#res-image-item-' + name).addClass('big-list-item-selected');
            $('#image-add-path').val('');
            $('#image-add-name').val('');
            draw_img_thumb(name);
        } else {
            notify(err, 'danger', 'resources-images');
        }
    });
});
$(document).on('click', '#res-images-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    $('#res-images-list > .big-list-item-selected').removeClass('big-list-item-selected');
    $(this).addClass('big-list-item-selected');
    draw_img_thumb(name);
});
$(document).on('click', '.btn-img-delete', function() {
    var id = $(this).attr('id');
    var name = id.substr(17, id.length);
    edit.resources.remove_img(name);
    clear_img_thumb();
    notify('image removed', 'success', 'resources-images');
});
$(document).on('click', '.btn-img-refresh', function() {
    var id = $(this).attr('id');
    var name = id.substr(18, id.length);
    edit.resources.refresh_img(name, function(success) {
        if (success) {
            notify('image refreshed successfully', 'success', 'resources-images');
            draw_img_thumb(name);
        } else {
            notify('there was a problem refreshing the image', 'danger', 'resources-images');
        }
    });
});
/* resources: sprites */
draw_sprite_thumb = function(name) {
    var imgob = edit.resources.sprites[name];
    if (imgob != undefined) {
        var img = imgob.img;
        var thumb_can = $('#sprite-thumb');
        var ctx = thumb_can[0].getContext('2d');
        thumb_can[0].width = thumb_can[0].width;
        ctx.drawImage(img, 0, 0);
        
        var clips = imgob.ob.clips;
        var dist_y = img.height/clips.y;
        var dist_x = img.width/clips.x;
        
        
        for (var i = 0; i <= clips.x; i++) {
            ctx.moveTo(dist_x * i, 0);
            ctx.lineTo(dist_x * i, img.height);
        }
        
        for (var i = 0; i <= clips.y; i++) {
            ctx.moveTo(0, dist_y * i);
            ctx.lineTo(img.width, dist_y * i);
        }
        
        ctx.strokeStyle = 'black';
        ctx.linewidth = 1;
        ctx.stroke();
        ctx.stroke();
    }
}
clear_sprite_thumb = function() {
    var thumb_can = $('#sprite-thumb');
    var ctx = thumb_can[0].getContext('2d');
    var w = parseInt(thumb_can.css('width'));
    var h = parseInt(thumb_can.css('height'));
    ctx.clearRect(0, 0, w, h);
}
$(document).on('click', '#btn-resources-sprites-back', function() {
    $('#shelf-resources-sprites').hide(200);
    $('#shelf-resources-all').show(200);
});
$(document).on('click', '#sprite-add-confirm', function() {
    var name = $('#sprite-add-name').val();
    var source = $('#sprite-add-path').val();
    var xclips = $('#sprite-add-xclips').val();
    var yclips = $('#sprite-add-yclips').val();
    
    var opts = {
        source: source,
        clips: {x: xclips, y: yclips}
    }
    
    edit.resources.add_sprite(name, opts, function(success, err) {
        if (success) {
            notify('sprite "'+ name +'" added', 'success', 'resources-sprites');
            $('#res-sprites-list > .big-list-item-selected').removeClass('big-list-item-selected');
            $('#res-sprites-item-' + name).addClass('big-list-item-selected');
            $('#sprite-add-path').val('');
            $('#sprite-add-name').val('');
            $('#sprite-add-xclips').val('');
            $('#sprite-add-yclips').val('');
            draw_sprite_thumb(name);
        } else {
            notify(err, 'danger', 'resources-images');
        }
    });

});
$(document).on('click', '#res-sprites-list > .big-list-item', function() {
    var name = $(this).children('p').html();
    $('#res-sprites-list > .big-list-item-selected').removeClass('big-list-item-selected');
    $(this).addClass('big-list-item-selected');
    draw_sprite_thumb(name);
});
$(document).on('click', '.btn-sprite-delete', function() {
    var id = $(this).attr('id');
    var name = id.substr(18, id.length);
    edit.resources.remove_sprite(name);
    clear_sprite_thumb();
    notify('sprite removed', 'success', 'resources-sprites');
});
$(document).on('click', '.btn-sprite-refresh', function() {
    var id = $(this).attr('id');
    var name = id.substr(19, id.length);
    edit.resources.refresh_sprite(name, function(success) {
        if (success) {
            notify('sprite refreshed successfully', 'success', 'resources-sprites');
            draw_sprite_thumb(name);
        } else {
            notify('there was a problem refreshing the sprite', 'danger', 'resources-sprites');
        }
    });
});






