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
$(document).on('click', '#btn-resources-images-back', function() {
    $('#shelf-resources-images').hide(200);
    $('#shelf-resources-all').show(200);
});
$(document).on('click', '#image-add-confirm', function() {
    var source = $('#image-add-path').val()
    var name = $('#image-add-name').val()
    
    if (edit.resources.images[name] != null) {
        notify('there is already an image named "' + name + '"', 'danger', 'resources-images');
    } else {
        edit.resources.add_img(name, source, function(success) {
            if (success) {
                notify('image "'+ name +'" added', 'success', 'resources-images');
            } else {
                notify('image at "' + source + '" could not be loaded', 'danger', 'resources-images');
            }
        });
    }
});






