//= require ./Tank

window.Replay = (function() {
    var r = {};

    r.width = 1200;
    r.height = 700;
    r.center = new Point(r.width/2, r.height/2);

    r.canvas = document.getElementById("tranque-replay");
    r.container = r.canvas.parentNode;
    r.toolbar = document.getElementById("tranque-toolbar");
    r.arena = new Shape.Rectangle(new Point(0, 0), new Point(r.width, r.height));
    r.arena.fillColor = "#444";
    r.scale = 1;
    r.tanks = [];

    r.transformPoint = function(point) {
        console.log(r.arena.bounds.left);
        return new Point(point.x*r.scale + r.arena.bounds.left, point.y*r.scale + r.arena.bounds.top);
    };

    r.transformLength = function(l) {
        return l*r.scale;
    }


    r.adjustSize = function() {
        view.viewSize.width = r.container.offsetWidth;
        view.viewSize.height = r.container.offsetHeight - r.toolbar.offsetHeight;
        r.arena.fitBounds(view.bounds);
        r.scale = r.arena.bounds.width/r.width;
        r.tanks.forEach(function(tank) {
            tank.scale();
        });
    };

    r.addTank = function(options) {
        r.tanks.push(Tank.makeTank(options));
    };

    r.animate = function() {
        r.tanks.forEach(function(tank) {
            tank.setHeading(tank.heading + 0.1);
            tank.setTurretHeading(tank.turretHeading - 0.1);
        });
    };

    r.init = function() {
        r.adjustSize();
        r.addTank();

        window.addEventListener("resize", function() {
            r.adjustSize();
        });

        view.on("frame", r.animate);
    };

    return r;
})();

Replay.init();
