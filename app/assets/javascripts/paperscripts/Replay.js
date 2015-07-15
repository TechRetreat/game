//= require ./helpers
//= require ./Scalable
//= require ./Explosion
//= require ./Shell
//= require ./Tank

window.Replay = (function() {
    var r = {};

    r.width = 1200;
    r.height = 700;
    r.center = new Point(r.width/2, r.height/2);
    r.tick = 0;

    r.canvas = document.getElementById("tranque-replay");
    r.container = r.canvas.parentNode;
    r.toolbar = document.getElementById("tranque-toolbar");
    r.arena = new Shape.Rectangle(new Point(0, 0), new Point(r.width, r.height));
    r.arena.fillColor = "#444";
    r.scale = 1;
    r.tanks = [];
    r.explosions = [];
    r.shells = [];

    r.transformPoint = function(point) {
        return new Point(point.x*r.scale + r.arena.bounds.left, point.y*r.scale + r.arena.bounds.top);
    };

    r.transformLength = function(l) {
        return l*r.scale;
    };


    r.adjustSize = function() {
        view.viewSize.width = r.container.offsetWidth;
        view.viewSize.height = r.container.offsetHeight - r.toolbar.offsetHeight;
        r.arena.fitBounds(view.bounds);
        r.scale = r.arena.bounds.width/r.width;
        r.tanks.forEach(function(tank) {
            tank.transform();
        });
        r.explosions.forEach(function(explosion) {
            explosion.transform();
        });
        r.shells.forEach(function(shell) {
            shell.transform();
        });
    };

    r.addTank = function(options) {
        r.tanks.push(Tank.new(options));
    };

    r.explode = function(explosion) {
        r.explosions.push(explosion);
    };

    r.addShell = function(shell) {
        r.shells.push(shell);
    };

    r.animate = function() {
        r.tick++;

        r.tanks = r.tanks.filter(function(tank) {
            return tank.alive;
        });
        r.tanks.forEach(function(tank) {
            tank.setHeading(tank.heading + random(0, 0.1));
            tank.setTurretHeading(tank.turretHeading + random(0, 0.025));
            tank.setHealth(tank.health - random(0, 0.01));
            tank.speed = Tank.MAX_SPEED;
            tank.move();

            if (int(random(0, 40)) == 0) {
                tank.shoot(random(2,Tank.MAX_POWER));
            }
        });

        r.explosions = r.explosions.filter(function(explosion) {
            return explosion.alive;
        });
        r.explosions.forEach(function(explosion) {
            explosion.tick();
        });

        r.shells = r.shells.filter(function(shell) {
            return shell.alive;
        });
        r.shells.forEach(function(shell) {
            shell.tick();
        });

    };

    r.init = function() {
        r.adjustSize();
        r.addTank({
            position: new Point(random(r.width*0.2, r.width*0.5), random(r.height*0.4, r.height*0.6)),
            color: "#DD1100",
            name: "YuChenBot"
        });

        r.addTank({
            position: new Point(random(r.width*0.5, r.width*0.8), random(r.height*0.4, r.height*0.6)),
        });


        window.addEventListener("resize", throttle(function() {
            r.adjustSize();
            r.tanks.forEach(function(tank) {
                tank.transform();
            });
            r.explosions.forEach(function(explosion) {
                explosion.transform();
            });
        }, 200));

        view.on("frame", r.animate);
    };

    return r;
})();

Replay.init();
