function _Shell(options) {
    options = options || {};
    this.id = options.id || -1;
    this.object = Scalable.new(Shell.symbol.place());
    this.object.setPosition(options.position);
    this.object.rotate(toDegrees(options.heading));

    this.alive = true;

    this.velocity = toCartesian(options.speed*Shell.SPEED_FACTOR, options.heading);
}

_Shell.prototype = {
    tick: function() {
        this.object.addPosition(this.velocity);
        if (!this.object.position.isInside(new Rectangle(0, 0, Replay.width, Replay.height))) {
            this.die();
        }
    },
    setPosition: function(position) {
        this.object.setPosition(position);
    },
    die: function() {
        this.object.remove();
        this.alive = false;
    },
    transform: function() {
        this.object.transform();
    }
};

window.Shell = (function() {
    var s = {};

    s.SPEED_FACTOR = 4.5 * 2;

    var path = new Path({
        segments: [
            [-2, 2],
            [2, 2],
            [4, 0],
            [2, -2],
            [-2, -2]
        ],
        fillColor: "#FFF",
        closed: true
    });

    s.symbol = new Symbol(path);
    s.new = function(location, heading, power) {
        return new _Shell(location, heading, power);
    };

    return s;
})();
