window.Tank = (function() {
    var t = {};

    t.MAX_SPEED = 3;

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

    var toDegrees = function(angle) {
        return angle / Math.PI * 180;
    };

    var toCartesian = function(radius, angle) {
        return new Point(radius*Math.cos(angle), radius*Math.sin(angle));
    };

    t.makeTank = function(options) {
        options = options || {};

        var body = t.body.place();
        body.name = "body";

        var gun = t.gun.place();
        gun.name = "gun";

        var nameTag = new PointText(new Point(0, 65));
        nameTag.justification = "center";
        nameTag.fillColor = "#FFF";
        nameTag.fontSize = 18;
        nameTag.content = options.name || "TestTank";

        var healthBar = new Path.Line(new Point(-50, 40), new Point(50, 40));
        healthBar.pivot = healthBar.bounds.leftCenter;
        healthBar.strokeColor = "#0F0";
        healthBar.strokeWidth = 3;

        var tank = {
            alive: true,
            body: body,
            gun: gun,
            object: new Group([body, gun, healthBar, nameTag]),
            heading: 0,
            turretHeading: 0,
            speed: 0,
            scaling: 1,
            health: 1,
            setHeading: function(angle) {
                this.heading = angle;
                this.body.rotation = toDegrees(angle);
            },
            setTurretHeading: function(angle) {
                this.turretHeading = angle;
                this.gun.rotation = toDegrees(angle);
            },
            move: function() {
                this.position += toCartesian(this.speed, this.heading);
            },
            setHealth: function(h) {
                healthBar.scale(1/this.health);
                healthBar.scale(h);
                if (h > 0.5) {
                    healthBar.strokeColor = lerpColor("#FFFF00", "#00FF00", map(h, 0.5, 1, 0, 1));
                } else {
                    healthBar.strokeColor = lerpColor("#FF0000", "#FFFF00", map(h, 0, 0.5, 0, 1));
                }
                this.health = h;
                if (h <= 0) {
                    this.alive = false;
                    this.object.removeChildren();
                    this.object.remove;
                    Replay.explode(Explosion.makeExplosion(Replay.transformPoint(this.position)));
                }
            },
            update: function() {
                this.object.position = Replay.transformPoint(tank.position);
                this.object.scale(1/this.scaling);
                this.scaling = Replay.scale;
                this.object.scale(this.scaling);
            }
        };
        tank.body.pivot = new Point(0, 0);
        tank.gun.pivot = new Point(0, 0);
        tank.object.pivot = new Point(0, 0);
        tank.position = options.position || Replay.center;
        tank.update();
        return tank;
    };

    return t;
})();
