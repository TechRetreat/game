function _Tank(options) {
    options = options || {};
    options.color = options.color || "#AAAAAA";
    var tintedColor = lerpColor(options.color, "#000000", 0.2);

    this.alive = true;
    this.heading = 0;
    this.turretHeading = 0;
    this.radarHeading = 0;
    this.speed = 0;
    this.health = 1;
    this.name = options.name || "TestTank";
    this.current = options.current || false;

    var sweep = new Path({
        segments: [
            [0, 0],
            [200, (200/Math.cos(10/180 * Math.PI))*Math.sin(10/180 * Math.PI)],
            [200, -(200/Math.cos(10/180 * Math.PI))*Math.sin(10/180 * Math.PI)]
        ],
        fillColor: new Color(
            new Gradient([
                new Color(0.5, 1, 0.5, 0.3),
                new Color(0.5, 1, 0.5, 0)
            ]),
            new Point(0, 0),
            new Point(200, 0)
        ),
        closed: true
    });

    this.radar = new Group({
        transformContent: false,
        children: []
    });
    this.radar.pivot = new Point(0, 0);
    this.radar.addChildren([sweep]);

    // Body
    var main = new Shape.Rectangle(new Point(-15, -15), new Point(15, 15));
    main.fillColor = options.color;
    main.strokeColor = tintedColor;
    main.strokeWidth = 3;

    this.body = new Group({
        transformContent: false,
        children: []
    });
    this.body.pivot = new Point(0, 0);
    this.body.addChildren([main]);

    // Gun
    var hatch = new Shape.Circle(new Point(0, 0), 8);
    hatch.fillColor = tintedColor;

    var barrel = new Shape.Rectangle(new Point(0, -2), new Point(30, 2));
    barrel.fillColor = tintedColor;

    this.gun = new Group({
        transformContent: false,
        children: []
    });
    this.gun.pivot = new Point(0, 0);
    this.gun.addChildren([hatch, barrel]);

    this.nameTag = new PointText(new Point(0, 45));
    this.nameTag.justification = "center";
    this.nameTag.fillColor = "#FFF";
    this.nameTag.fontSize = 18;
    this.nameTag.content = this.name;

    this.healthTag = new PointText(new Point(0, -35));
    this.healthTag.justification = "center";
    this.healthTag.fillColor = "#0F0";
    this.healthTag.fontSize = 15;
    this.healthTag.content = "100";

    var obj = new Group({
        transformContent: false,
        children: []
    });
    obj.addChildren([this.radar, this.body, this.gun, this.healthTag, this.nameTag]);
    obj.pivot = new Point(0, 0);

    this.object = Scalable.new(obj);
    this.object.setPosition(options.position || Replay.center);
}

_Tank.prototype = {
    setHeading: function(angle) {
        this.body.rotation = toDegrees(angle);
        this.heading = angle;
    },
    setTurretHeading: function(angle) {
        this.gun.rotation = toDegrees(angle);
        this.turretHeading = angle;
    },
    setRadarHeading: function(angle) {
        this.radar.rotation = toDegrees(angle);
        this.radarHeading = angle;
    },
    setPosition: function(point) {
        this.speed = (this.object.position - point).length
        this.object.setPosition(point);
    },
    move: function() {
        if (this.object.shape.position.isInside(Replay.arena.bounds)) this.object.addPosition(toCartesian(this.speed, this.heading));
    },
    setHealth: function(h) {
        if (h > 0.5) {
            this.healthTag.fillColor = lerpColor("#FFFF00", "#00FF00", map(h, 0.5, 1, 0, 1));
        } else {
            this.healthTag.fillColor = lerpColor("#FF0000", "#FFFF00", map(h, 0, 0.5, 0, 1));
        }
        this.healthTag.content = roundTo(h*100, 1);

        if (h <= 0) {
            this.alive = false;
            this.object.remove();
            Replay.explode(Explosion.new(this.object.position, "death"));
        } else if (this.health - h > 0.01) {
            Replay.explode(Explosion.new(this.object.position, "damage"))
        }
        this.health = h;
    },
    transform: function() {
        this.object.transform();
    }
}

window.Tank = (function() {
    var t = {};

    t.MAX_SPEED = 3;
    t.MAX_POWER = 10;
    t.TURRET_LENGTH = 28;

    t.new = function(options) {
        return new _Tank(options);
    };

    return t;
})();
