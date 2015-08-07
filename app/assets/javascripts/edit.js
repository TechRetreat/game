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
$(document).on('page:before-change', function(){
    if (unsaved) {
        return confirm(handleLeaveEvent());
    }
});

function setVisibleLeft(id){
    $('#editor').hide();
    $('#edit').hide();
    $('#published').hide();

    $(id).show();
    $(id).addClass('animated fadeIn');
}
function setVisibleRight(id){
    $('#play').hide();
    $('#info').hide();

    $(id).show();
    $(id).addClass('animated fadeIn');
}
function setTab(id){
    $('#open_editor').removeClass("selected");
    $('#open_info').removeClass("selected");
    $('#open_edit').removeClass("selected");
    $('#open_published').removeClass("selected");

    $(id).addClass("selected");
}
$('#open_editor').click(function(){
    setVisibleLeft('#editor');
    setTab('#open_editor');
});
$('#open_info').click(function(){
    setVisibleRight('#info');
    setTab('#open_info');
});
$('#open_edit').click(function(){
    setVisibleLeft('#edit');
    setTab('#open_edit');
});
$('#open_published').click(function(){
  setVisibleLeft('#published');
  setTab('#open_published');
});
setVisibleLeft('#editor');
setVisibleRight('#info');
setTab('#open_editor');


$('#save').click(function(){
    saveCode()
        .done(function() {
            Replay.addNotice("Code saved!");
        })
        .fail(function() {
            Replay.addNotice("Error saving, try again later.");
        });
});

$('#publish', '#publish-btn').click(function(){
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
    saveCode()
        .done(function() {
            Replay.simulate();
        })
        .fail(function() {
            Replay.addNotice("Error saving, try again later.");
        });
});

//resize editor width

var isResizing = false,
    lastDownX = 0;

$(function () {
    var container = $('#main'),
        left = $('#left'),
        right = $('#right'),
        handle = $('#handle');

    handle.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientX;
    });

    $(document).on('mousemove', function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing)
            return;

        var offsetRight = container.width() - (e.clientX - container.offset().left);

        left.css('right', offsetRight);
        right.css('width', offsetRight);
        Replay.adjustSize();
        e.preventDefault();
        return false;
    }).on('mouseup', function (e) {
        // stop resizing
        isResizing = false;
    });
});
