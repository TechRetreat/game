/**
 * Created by yuchen.hou on 15-08-05.
 */
window.onbeforeunload = function(){
    // Do something
};
// OR
window.addEventListener("beforeunload", function(e){
    // Do something
}, false);

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

console.log('hi')