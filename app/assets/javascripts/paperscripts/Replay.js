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
    r.lastTick = 0;
    r.incoming = [];

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
        r.tanks = r.tanks.filter(function(tank) {
            return tank.alive;
        });
        r.explosions = r.explosions.filter(function(explosion) {
            return explosion.alive;
        });
        r.shells = r.shells.filter(function(shell) {
            return shell.alive;
        });
        if (r.incoming.length > 0 && r.incoming[0].tick <= r.lastTick+1) {
            data = r.incoming.shift();
            r.lastTick = data.tick;

            console.log("Applying incoming data:", data);

            //TODO: update positions and such with data from sockets

        //Interpolate!
        } else {
            r.lastTick++;
            console.log("Interpolating");

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

            r.shells.forEach(function(shell) {
                shell.tick();
            });
        }

        r.explosions.forEach(function(explosion) {
            explosion.tick();
        });
    };

    r.setup = function() {
        r.adjustSize();
        window.addEventListener("resize", throttle(function() {
            r.adjustSize();
            r.tanks.forEach(function(tank) {
                tank.transform();
            });
            r.explosions.forEach(function(explosion) {
                explosion.transform();
            });
        }, 200));
    };

    r.init = function(setup) {
        setup = setup || {};
        if (r.loadingText) {
            r.loadingText.remove();
        }
        console.log("Setting up", setup);

        r.width = setup.width || r.width;
        r.height = setup.height || r.height;

        for (tank in setup.tanks) {
            r.addTank({
                position: setup.tanks[tank].position ? new Point(setup.tanks[tank].position.x, setup.tanks[tank].position.y) : undefined,
                color: setup.tanks[tank].color,
                name: tank
            });
        }
        console.log("Made tanks:", r.tanks);

        r.adjustSize();

        view.on("frame", r.animate);
    };

    r.end = function() {
         console.log("End transmission");
    };

    r.tick = function(tick) {
        r.incoming.push(tick);
    };

    r.listen = function(id) {
        r.setup();
        r.dispatcher = new WebSocketRails("localhost:3000/websocket");
        r.channel = r.dispatcher.subscribe_private("match." + id);
        r.channel.bind("start", r.init);
        r.channel.bind("stop", r.end);
        r.channel.bind("tick", r.tick);

        r.loadingText = new PointText(view.center);
        r.loadingText.justification = "center";
        r.loadingText.fillColor = "#FFF";
        r.loadingText.fontSize = 18;
        r.loadingText.content = "Loading match...";
    };

    return r;
})();

Replay.listen(123);

