/**
 * Created by yuchen.hou on 15-08-05.
 */
var unsaved = false;

window.addEventListener("beforeunload", function (e) {
    if(unsaved){
        var confirmationMessage = 'It looks like you have unsaved code.';
        confirmationMessage += 'If you leave before saving, your changes will be lost.';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
});


function setVisibleLeft(id){
    $('#editor').css("display", "none");
    $('#info').css("display", "none");

    $(id).css("display", "block");
}
function setVisibleRight(id){
    $('#play').css("display", "none");
    $('#edit').css("display", "none");

    $(id).css("display", "block");
}
function setTab(id){
    $('#open_editor').removeClass("selected");
    $('#open_info').removeClass("selected");
    $('#open_edit').removeClass("selected");

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
