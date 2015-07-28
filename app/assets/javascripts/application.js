// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require bootstrap
//= require ace/ace
//= require ace/worker-html
//= require ace/theme-monokai
//= require ace/mode-ruby
//= require paper
//= require websocket_rails/main

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


var manageAlerts = function() {
    $(".alert, .notice").click(function() {
        $(this).addClass("alert_hidden");
    }).each(function(index) {
        setTimeout(function() {
            $(this).addClass("alert_hidden");
        }.bind(this), 2000 + 1000*index);
    });
}
$(document).on('page:load', manageAlerts);
$(document).ready(manageAlerts);
