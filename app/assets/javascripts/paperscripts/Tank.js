window.Tank = (function() {
    var t = {};

    // Body
    var main = new Shape.Rectangle(new Point(-20, -20), new Point(20, 20));
    main.fillColor = "#CCC";

    var bodyGroup = new Group([main]);
    t.body = new Symbol(bodyGroup, true);
    bodyGroup.remove();

    // Gun
    var hatch = new Shape.Circle(new Point(0, 0), 10);
    hatch.fillColor = "#AAA";

    var barrel = new Shape.Rectangle(new Point(0, -2), new Point(30, 2));
    barrel.fillColor = "#AAA";

    var gunGroup = new Group([hatch, barrel]);
    t.gun = new Symbol(gunGroup, true);
    gunGroup.remove();

    var to_deg = function(angle) {
        return angle / Math.PI * 180;
    };

    t.makeTank = function(options) {
        options = options || {};

        var body = t.body.place();
        body.name = "body";

        var gun = t.gun.place();
        gun.name = "gun";

        var tank = {
            body: body,
            gun: gun,
            object: new Group([body, gun]),
            heading: 0,
            turretHeading: 0,
            speed: 0,
            setHeading: function(angle) {
                this.heading = angle;
                this.body.rotation = to_deg(angle);
            },
            setTurretHeading: function(angle) {
                this.turretHeading = angle;
                this.gun.rotation = to_deg(angle);
            }
        };
        tank.body.pivot = new Point(0, 0);
        tank.gun.pivot = new Point(0, 0);
        tank.object.pivot = new Point(0, 0);
        tank.object.position = options.position || view.center;
        return tank;
    };

    return t;
})();
