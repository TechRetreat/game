window.Tank = (function() {
    var t = {};

    // Body
    var main = new Shape.Rectangle(new Point(-20, -20), new Point(20, 20));
    main.fillColor = "#CCC";

    var body = new Group([main]);

    // Gun
    var hatch = new Shape.Circle(new Point(0, 0), 10);
    hatch.fillColor = "#AAA";

    var barrel = new Shape.Rectangle(new Point(0, -2), new Point(30, 2));
    barrel.fillColor = "#AAA";

    var gun = new Group([hatch, barrel]);

    // Tank
    var tankGroup = new Group([body, gun]);
    t.tank = new Symbol(tankGroup);
    tankGroup.remove();

    t.makeTank = function(options) {
        options = options || {};
        var tank = {
            symbol: t.tank.place(options.location || view.center)
        };
        return tank;
    };

    return t;
})();
