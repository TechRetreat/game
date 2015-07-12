//= require ./Tank

window.replay = (function() {
    var r = {};

    r.canvas = document.getElementById("tranque-replay");
    r.container = r.canvas.parentNode;
    r.toolbar = document.getElementById("tranque-toolbar");
    r.background = new Shape.Rectangle(new Point(0, 0), new Point(1280, 720));
    r.background.fillColor = "#444";
    r.tanks = [];

    r.adjustSize = function() {
        view.viewSize.width = r.container.offsetWidth;
        view.viewSize.height = r.container.offsetHeight - r.toolbar.offsetHeight;
        r.background.fitBounds(view.bounds);
    };

    r.addTank = function(options) {
        r.tanks.push(Tank.makeTank());
    };

    r.init = function() {
        r.addTank();
        r.adjustSize();

        window.addEventListener("resize", function() {
            r.adjustSize();
        });
    };

    return r;
})();

replay.init();
