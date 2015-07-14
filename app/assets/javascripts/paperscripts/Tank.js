function _Tank(options) {
    options = options || {};
    options.color = options.color || "#AAAAAA";
    var tintedColor = lerpColor(options.color, "#000000", 0.2);

    this.alive = true;
    this.heading = 0;
    this.turretHeading = 0;
    this.speed = 0;
    this.health = 1;

    // Body
    var main = new Shape.Rectangle(new Point(-20, -20), new Point(20, 20));
    main.fillColor = options.color;
    main.strokeColor = tintedColor;
    main.strokeWidth = 3;

    this.body = new Group([main]);
    this.body.pivot = new Point(0, 0);

    // Gun
    var hatch = new Shape.Circle(new Point(0, 0), 10);
    hatch.fillColor = tintedColor;

    var barrel = new Shape.Rectangle(new Point(0, -2), new Point(30, 2));
    barrel.fillColor = tintedColor;

    this.gun = new Group([hatch, barrel]);
    this.gun.pivot = new Point(0, 0);

    this.nameTag = new PointText(new Point(0, 65));
    this.nameTag.justification = "center";
    this.nameTag.fillColor = "#FFF";
    this.nameTag.fontSize = 18;
    this.nameTag.content = options.name || "TestTank";

    this.healthBar = new Path.Line(new Point(-50, 40), new Point(50, 40));
    this.healthBar.pivot = this.healthBar.bounds.leftCenter;
    this.healthBar.strokeColor = "#0F0";
    this.healthBar.strokeWidth = 3;

    var obj = new Group([]);
    obj.pivot = new Point(0, 0);
    obj.addChildren([this.body, this.gun, this.healthBar, this.nameTag]);

    this.object = Scalable.new(obj);
    this.object.setPosition(options.position || Replay.center);
}

_Tank.prototype = {
    setHeading: function(angle) {
        this.body.rotation = toDegrees(angle - this.heading);
        this.heading = angle;
    },
    setTurretHeading: function(angle) {
        this.gun.rotation = toDegrees(angle - this.turretHeading);
        this.turretHeading = angle;
    },
    setPosition: function(point) {
        this.object.setPosition(point);
    },
    move: function() {
        this.object.addPosition(toCartesian(this.speed, this.heading));
    },
    setHealth: function(h) {
        this.healthBar.scale(1/this.health);
        this.healthBar.scale(h);
        if (h > 0.5) {
            this.healthBar.strokeColor = lerpColor("#FFFF00", "#00FF00", map(h, 0.5, 1, 0, 1));
        } else {
            this.healthBar.strokeColor = lerpColor("#FF0000", "#FFFF00", map(h, 0, 0.5, 0, 1));
        }
        this.health = h;
        if (h <= 0) {
            this.alive = false;
            this.object.remove();
            Replay.explode(Explosion.new(this.object.position));
        }
    },
    update: function() {
        this.object.update();
    }
}

window.Tank = (function() {
    var t = {};

    t.MAX_SPEED = 3;

    t.new = function(options) {
        return new _Tank(options);
    };

    return t;
})();