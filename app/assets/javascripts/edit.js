/**
 * Created by yuchen.hou on 15-08-05.
 */
var unsaved = false;

function handleLeaveEvent(e) {
    if (unsaved) {
        var confirmationMessage = 'It looks like you have unsaved code.';
        confirmationMessage += 'If you leave before saving, your changes will be lost.';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
}

//Refresh
window.addEventListener("beforeunload", handleLeaveEvent());
$(window).on('beforeunload', function(){
    return handleLeaveEvent();
});
$(document).on('page:before-change', function(){
    if (unsaved) {
        return confirm(handleLeaveEvent());
    }
});

function setVisibleLeft(id){
    $('#editor').hide();
    $('#edit').hide();
    $('#published').hide();
    $('#logs').hide();

    $(id).show();
    $(id).addClass('animated fadeIn');
}
function setVisibleRight(id){
    $('#play').hide();
    $('#docs').hide();
    $('#getting-started').hide();

    $(id).show();
    $(id).addClass('animated fadeIn');
}
function setTabLeft(id){
    $('#open_editor').removeClass("selected");
    $('#open_edit').removeClass("selected");
    $('#open_published').removeClass("selected");
    $('#open_logs').removeClass("selected");

    if(id == '#open_logs') {
        $('#replay-notices').hide();
    } else {
        $('#replay-notices').show();
    }

    if(id == '#open_editor') {
        $('#set-theme').show();
        $('#save').show();
        $('#publish').show();
    } else {
        $('#set-theme').hide();
        $('#save').hide();
        $('#publish').hide();
    }

    $(id).addClass("selected");
}
function setTabRight(id){
    if(!$(id).hasClass("selected")) {
        if(id == '#play-btn') {
            $("#replay-notices").addClass("visible");
        } else {
            $("#replay-notices").removeClass("visible");
        }
    }

    $('#open_docs').removeClass("selected");
    $('#open_start').removeClass("selected");
    $('#play-btn').removeClass("selected");

    $(id).addClass("selected");
}
$('#open_editor').click(function(){
    setVisibleLeft('#editor');
    setTabLeft('#open_editor');
});
$('#open_docs').click(function(){
    setVisibleRight('#docs');
    setTabRight('#open_docs');
});
$('#open_start').click(function(){
    setVisibleRight('#getting-started');
    setTabRight('#open_start');
});
$('#open_edit').click(function(){
    setVisibleLeft('#edit');
    setTabLeft('#open_edit');
});
$('#open_published').click(function(){
  setVisibleLeft('#published');
  setTabLeft('#open_published');
});
$('#open_logs').click(function(){
    setVisibleLeft('#logs');
    setTabLeft('#open_logs');
});
setVisibleLeft('#editor');
setVisibleRight('#getting-started');
setTabLeft('#open_editor');
setTabRight('#open_start');

$('#save').click(function(){
    saveCode()
        .done(function() {
            Replay.addNotice("Code saved!");
        })
        .fail(function() {
            Replay.addNotice("Error saving, try again later.");
        });
});
$('#publish, #publish-btn').click(function(){
    publishCode()
        .done(function() {
            Replay.addNotice("Code published!");
        })
        .fail(function() {
            Replay.addNotice("Error publishing, try again later.");
        });
});

$('#play-btn').click(function(){
    setVisibleRight('#play');
    setTabRight('#play-btn');
    saveCode()
        .done(function() {
            Replay.simulate();
        })
        .fail(function() {
            Replay.addNotice("Error saving, try again later.");
        });
});

$('#set-theme').click(function(){
    if($('#set-theme').hasClass('white-icon')) {
        $('#set-theme').removeClass('white-icon');
        $('#set-theme').removeClass('fa-sun-o');
        $('#publish').removeClass('white-icon');
        $('#save').removeClass('white-icon');

        $('#set-theme').addClass('black-icon fa-moon-o');
        $('#publish').addClass('black-icon');
        $('#save').addClass('black-icon');
        editor.setTheme("ace/theme/solarized_light");
    } else {
        $('#set-theme').removeClass('black-icon');
        $('#set-theme').removeClass('fa-moon-o');
        $('#publish').removeClass('black-icon');
        $('#save').removeClass('black-icon');

        $('#set-theme').addClass('fa-sun-o white-icon');
        $('#publish').addClass('white-icon');
        $('#save').addClass('white-icon');
        editor.setTheme("ace/theme/solarized_dark");
    }
});

//resize editor width

var isResizing = false,
    lastDownX = 0;
var minimumSize = 250;

$(function () {
    var container = $('#main'),
        left = $('#left'),
        right = $('#right'),
        handle = $('#handle');

    handle.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
        left.addClass('hide-selection');
        right.addClass('hide-selection');
    });

    $(document).on('mousemove', function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing)
            return;

        var offsetRight = container.width() - (e.clientX - container.offset().left);
        if(offsetRight < minimumSize) {
            offsetRight = minimumSize;
        } else if(offsetRight > container.width() - minimumSize) {
            offsetRight = container.width() - minimumSize;
        }
        left.css('right', offsetRight);
        right.css('width', offsetRight);
        Replay.adjustSize();
        e.preventDefault();
        return false;
    }).on('mouseup', function (e) {
        // stop resizing
        isResizing = false;
        left.removeClass('hide-selection');
        right.removeClass('hide-selection');
    });
});
