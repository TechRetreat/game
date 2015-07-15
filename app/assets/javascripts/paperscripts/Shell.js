function _Shell(location, heading, power) {
    this.object = Scalable.new(Shell.symbol.place());
    this.object.setPosition(location);
    this.object.rotate(toDegrees(heading));

    this.alive = true;

    this.velocity = toCartesian(power, heading);
}

_Shell.prototype = {
    tick: function() {
        this.object.addPosition(this.velocity);
        if (!this.object.position.isInside(new Rectangle(0, 0, Replay.width, Replay.height))) {
            this.die();
        }
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
