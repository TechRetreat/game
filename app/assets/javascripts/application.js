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
//= require jquery.turbolinks
//= require jquery_ujs
//= require turbolinks
//= require bootstrap
//= require bootstrap-toggle
//= require ace/ace
//= require ace/worker-html
//= require bootstrap-sweetalert
//= require sweet-alert-confirm
//= require ace/theme-solarized_dark
//= require ace/theme-solarized_light
//= require ace/mode-ruby
//= require paper
//= require websocket_rails/main
//= require highlightjs

$(document).ready(function() {
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
});


var manageAlerts = function() {
    $(".alert, .notice").click(function() {
        $(this).addClass("alert_hidden");
    }).each(function(index) {
        setTimeout(function() {
            $(this).addClass("alert_hidden");
        }.bind(this), 3000 + 1000*index);
    });
};

$(document).ready(function(){
    $("#open-menu").click(function() {
        $("#sidebar-wrapper").toggleClass("opened");
    });
    manageAlerts();
});

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-66098973-1', 'auto');
ga('send', 'pageview');