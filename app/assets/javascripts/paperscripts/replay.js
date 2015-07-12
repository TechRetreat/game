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

    r.animate = function() {
        r.tanks.forEach(function(tank) {
            tank.setHeading(tank.heading + 0.1);
            tank.setTurretHeading(tank.turretHeading - 0.1);
        });
    };

    r.init = function() {
        r.addTank();
        r.adjustSize();

        window.addEventListener("resize", function() {
            r.adjustSize();
        });

        view.on("frame", r.animate);
    };

    return r;
})();

replay.init();
