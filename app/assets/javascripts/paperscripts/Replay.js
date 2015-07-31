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
    r.id = 0;
    r.lastTick = 0;
    r.incoming = [];

    r.canvas = document.getElementById("tranque-replay");
    r.container = r.canvas.parentNode;
    r.toolbar = document.getElementById("tranque-toolbar");
    r.scale = 1;
    r.tanks = {};
    r.explosions = [];
    r.shells = {};

    r.transformPoint = function(point) {
        return new Point(point.x*r.scale + r.arena.bounds.left, point.y*r.scale + r.arena.bounds.top);
    };

    r.transformLength = function(l) {
        return l*r.scale;
    };


    r.adjustSize = function() {
        view.viewSize.width = r.container.offsetWidth;
        view.viewSize.height = r.container.offsetHeight;
        r.arena.fitBounds(view.bounds);
        r.scale = r.arena.bounds.width/r.width;
        for (tank in r.tanks) {
            r.tanks[tank].transform();
        };
        r.explosions.forEach(function(explosion) {
            explosion.transform();
        });
        for (shell in r.shells) {
            r.shells[shell].transform();
        }
    };

    r.addTank = function(options) {
        r.tanks[options.name] = Tank.new(options);
    };

    r.explode = function(explosion) {
        r.explosions.push(explosion);
    };

    r.addShell = function(shell) {
        r.shells[shell.id] = shell;
    };

    r.animate = function() {
        for (tank in r.tanks) {
            if (!r.tanks[tank].alive) {
                delete r.tanks[tank]
            }
        }
        r.explosions = r.explosions.filter(function(explosion) {
            return explosion.alive;
        });
        for (shell in r.shells) {
            if (!r.shells[shell].alive) {
                delete r.shells[shell];
            } else {
                r.shells[shell].tick();
            }
        }
        if (r.incoming.length > 0 && r.incoming[0].tick <= r.lastTick+1) {
            data = r.incoming.shift();
            r.lastTick = data.tick;
            if (data.hasOwnProperty("created")) {
                data.created.forEach(function(shell) {
                    Replay.addShell(Shell.new({
                        id: shell.id,
                        heading: shell.heading,
                        speed: shell.speed,
                        position: new Point(shell.x, shell.y)
                    }));
                });
            }
            data.tanks.forEach(function(tankData) {
                var tank = r.tanks[tankData.name];
                //TODO: use radar heading
                if (tankData.hasOwnProperty("health")) tank.setHealth(tankData.health/100);
                if (tankData.hasOwnProperty("heading")) tank.setHeading(tankData.heading);
                if (tankData.hasOwnProperty("turret_heading")) tank.setTurretHeading(tankData.turret_heading);
                if (tankData.hasOwnProperty("x") && tankData.hasOwnProperty("y")) tank.setPosition(new Point(tankData.x, tankData.y));
            });

            //TODO: update positions and such with data from sockets

        //Interpolate!
        } else {
            r.lastTick++;

            //r.tanks.forEach(function(tank) {
                //tank.setHeading(tank.heading + random(0, 0.1));
                //tank.setTurretHeading(tank.turretHeading + random(0, 0.025));
                //tank.setHealth(tank.health - random(0, 0.01));
                //tank.speed = Tank.MAX_SPEED;
                //tank.move();

                //if (int(random(0, 40)) == 0) {
                    //tank.shoot(random(2,Tank.MAX_POWER));
                //}
            //});

            //r.shells.forEach(function(shell) {
                //shell.tick();
            //});
        }

        r.explosions.forEach(function(explosion) {
            explosion.tick();
        });
        paper.view.update();
    };

    r.setup = function() {
        var matches = /tanks\/(\d+)/.exec(window.location.href);
        if (matches) {
            r.id = parseInt(matches[1]);
        } else {
            console.log("Couldn't match id in url:", window.location.href)
        }
    };

    r.init = function(setup) {
        setup = setup || {};
        if (r.loadingText) {
            r.loadingText.remove();
        }
        console.log("Setting up", setup);

        r.width = setup.width || r.width;
        r.height = setup.height || r.height;
        r.center = new Point(r.width/2, r.height/2);

        r.arena = new Shape.Rectangle(new Point(0, 0), new Point(r.width, r.height));
        r.arena.fillColor = "#444";


        setup.tanks.forEach(function(tank) {
            r.addTank({
                position: tank.position ? new Point(tank.position.x, tank.position.y) : undefined,
                color: tank.color,
                name: tank.name
            });
            if (tank.hasOwnProperty("heading")) r.tanks[tank.name].setHeading(tank.heading);
            if (tank.hasOwnProperty("turret_heading")) r.tanks[tank.name].setTurretHeading(tank.turret_heading);
        });

        r.adjustSize();
        window.addEventListener("resize", throttle(function() {
            r.adjustSize();
        }, 200));

        view.on("frame", r.animate);
    };

    r.end = function() {
        console.log("End transmission");
    };

    r.batch = function(data) {
        if (r.incoming.length == 0) console.log(data.batch);
        r.incoming = r.incoming.concat(data.batch);
    };

    r.listen = function() {
        console.log("Initializing replays");
        r.setup();
        r.loadingText = new PointText(view.center);
        r.loadingText.justification = "center";
        r.loadingText.fillColor = "#FFF";
        r.loadingText.fontSize = 18;
        r.loadingText.content = "Loading match...";

        $.ajax("/matches.json", {
            type: "POST",
            data: {
                match: {
                    tanks: [5, 6, r.id]
                }
            },
            dataType: "json",
            success: function(data) {
                console.log(data);
                r.dispatcher = new WebSocketRails("localhost:3000/websocket");
                r.dispatcher.on_open = function() {
                    r.channel = r.dispatcher.subscribe_private("match."+data.id);
                    r.channel.bind("start", r.init);
                    r.channel.bind("stop", r.end);
                    r.channel.bind("batch", r.batch);
                };
            }
        });


    };

    r.destruct = function() {

    };

    return r;
})();

$(document).ready(function() {
    Replay.destruct();
    Replay.listen();
});
