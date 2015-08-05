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


function setVisible(id){
    $('#editor').css("display", "none");
    $('#info').css("display", "none");
    $('#edit').css("display", "none");

    $(id).css("display", "block");
}
setVisible('#editor');
$('#open_editor').click(function(){
    setVisible('#editor');
});
$('#open_info').click(function(){
    setVisible('#info');
});
$('#open_edit').click(function(){
    setVisible('#edit');
});
setVisible('#editor');


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
    saveCode()
        .done(function() {
            Replay.simulate();
        })
        .fail(function() {
            Replay.addNotice("Error saving, try again later.");
        });
});