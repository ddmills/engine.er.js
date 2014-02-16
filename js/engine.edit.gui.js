var edit = null;
$(window).ready(function() {
    
    edit = new editor();
    
    var act_id = $('.active').attr('id');
    $('#shelf-' + act_id.substr(5, act_id.length)).show();
    $('.input-color').simpleColorPicker({ colorsPerLine: 16 });
});

/* utilities */
add_alert = function(message, type, id) {
    var ele = $("<div class='alert alert-" + type + "'>" + message + "</div>");
    ele.hide();
    $('#' + id + '-notify').append(ele);
    ele.show(500);
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
            add_alert('file ' + selected + ' loaded successfully' , 'success', 'editor');
        } else {
            add_alert('error opening file', 'danger', 'editor');
        }
    } else {
        add_alert('no file selected', 'danger', 'open-modal');
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
        window.edit.file.save_scenario();
    } else {
        var name = $('#saveas-file-name').val();
        $('#saveas-modal').modal('show');
    }
});
$(document).on('click', '#btn-file-saveas', function() {
    var name = $('#saveas-file-name').val();
    edit.file.save_scenario(name);
});
$(document).on('click', '#file-json-load', function() {
    console.log('wait ' + $('#area-left').css('width'));
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
        add_alert('game started', 'success', 'editor');
});

/* viewport shelf */
$(document).on('click', '#viewport-confirm', function() {
    var w = $('#viewport-width').val();
    var h = $('#viewport-height').val();
    var c = $('#viewport-bkg-color').val();
    edit.viewport.set_size(w, h);
    edit.viewport.set_background(c);
    add_alert('viewport updated', 'success', 'viewport');
});
$(document).on('click', '#viewport-cancel', function() {
    $('#viewport-width').val(edit.viewport.ob.width);
    $('#viewport-height').val(edit.viewport.ob.height);
    $('#viewport-bkg-color').val(edit.viewport.ob.background);
});

/* layers shelf */
$(document).on('click', '#view-layer-add', function() {
    
});
