function _Scalable(shape) {
    this.shape = shape;
    this.position = shape.position;
    this.lastScale = 1;

    this.transform();
}

_Scalable.prototype = {
    setPosition: function(position) {
        if (position) {
            this.position = position;
        }
        this.shape.position = Replay.transformPoint(this.position);
    },
    addPosition: function(position) {
        this.position += position;
        this.setPosition();
    },
    scale: function(factor) {
        this.shape.scale(factor);
    },
    setOpacity: function(factor) {
        this.shape.opacity = factor;
    },
    fill: function(color) {
        this.shape.fillColor = color;
    },
    remove: function() {
        this.shape.remove();
    },
    transform: function() {
        this.shape.scale(1/this.lastScale);
        this.lastScale = Replay.scale;
        this.shape.scale(this.lastScale);
        this.setPosition();
    }
};

window.Scalable = (function() {
    var s = {};

    s.new = function(shape) {
        return new _Scalable(shape);
    };

    return s;
})();

