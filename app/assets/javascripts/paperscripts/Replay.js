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
    r.running = false;

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

    r.addNotice = function(text, backtrace, output) {
        var notice = $("<div class='replay-notice'></div>").text(text)
        if (backtrace) {
            var stack = $("<ol></ol>");
            backtrace.forEach(function(line) {
                var listItem = $("<li></li>").text(line);
                stack = stack.append(listItem);
            });
            notice = notice.append(stack);
        }
        if (output) {
            var pre = $("<pre></pre>").text(output);
            notice = notice.append(pre);
        }
        $("#replay-notices").addClass("visible")
        notice.appendTo("#replay-notices #console")
        $("#replay-notices #console").scrollTop($("#replay-notices #console")[0].scrollHeight);
    };

    r.clearNotices = function() {
        $("#replay-notices").removeClass("visible");
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

    r.interpolateObjects = function() {
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
        r.explosions.forEach(function(explosion) {
            explosion.tick();
        });
    };

    r.animate = function() {
        if (r.running == false && r.explosions.length == 0) {
            view.off("frame");
            r.addNotice("End of simulation - press play again to run another!");
            return;
        }

        var lastTickUsed = 0;
        while (r.incoming.length > 0 && (!r.incoming[0].tick || r.incoming[0].tick <= r.lastTick+1)) {
            r.interpolateObjects();
            data = r.incoming.shift();
            lastTickUsed = data.tick;
            if (data.hasOwnProperty("created")) {
                data.created.forEach(function(shell) {
                    Replay.addShell(Shell.new({
                        id: shell.id,
                        heading: fixAngle(shell.heading),
                        speed: shell.speed,
                        position: new Point(shell.x, shell.y)
                    }));
                });
            }
            if (data.hasOwnProperty("destroyed")) {
                data.destroyed.forEach(function(shell) {
                    if (!r.shells[shell.id]) return;
                    r.shells[shell.id].die();
                    delete r.shells[shell.id];
                });
            }
            for (tank in r.tanks) {
                r.tanks[tank].updated = false;
            }
            data.tanks.forEach(function(tankData) {
                var tank = r.tanks[tankData.name];
                tank.updated = true;
                if (tankData.hasOwnProperty("health")) tank.setHealth(tankData.health/100);
                if (tankData.hasOwnProperty("heading")) tank.setHeading(fixAngle(tankData.heading));
                if (tankData.hasOwnProperty("turret_heading")) tank.setTurretHeading(fixAngle(tankData.turret_heading));
                if (tankData.hasOwnProperty("radar_heading")) tank.setRadarHeading(fixAngle(tankData.radar_heading));
                if (tankData.hasOwnProperty("x") && tankData.hasOwnProperty("y")) tank.setPosition(new Point(tankData.x, tankData.y));
                if (tankData.hasOwnProperty("logs") && tankData.logs.length > 0) {
                  tankData.logs.forEach(function(log){
                    r.addNotice(tankData.name + ": " + log);
                  });
                }
                if (tankData.hasOwnProperty("error") && tankData.error !== null) {
                  r.addNotice(tankData.name + ": Health penalty from error '" + tankData.error.message + "'", tankData.error.backtrace);
                }
            });
            for (tank in r.tanks) {
                if (!r.tanks[tank].updated) r.tanks[tank].setHealth(0);
            }

            if (data.ended) {
                r.running = false;
            }
        }
        if (lastTickUsed > r.lastTick) {
            r.lastTick = data.tick;
        } else {

            r.lastTick++;

            r.interpolateObjects();

            for (tank in r.tanks) {
                r.tanks[tank].move();
            }
        }
    };

    r.init = function(setup) {
        setup = setup || {};
        if (r.loadingText) {
            r.loadingText.remove();
        }
        r.clearNotices();

        r.width = setup.width || r.width;
        r.height = setup.height || r.height;
        r.center = new Point(r.width/2, r.height/2);

        r.arena = new Shape.Rectangle(new Point(0, 0), new Point(r.width, r.height));
        r.arena.fillColor = "#073642";


        setup.tanks.forEach(function(tank) {
            r.addTank({
                position: tank.position ? new Point(tank.position.x, tank.position.y) : undefined,
                color: tank.color,
                name: tank.name,
            });
            if (tank.hasOwnProperty("heading")) r.tanks[tank.name].setHeading(tank.heading);
            if (tank.hasOwnProperty("turret_heading")) r.tanks[tank.name].setTurretHeading(tank.turret_heading);
        });

        r.adjustSize();
        window.addEventListener("resize", throttle(function() {
            r.adjustSize();
        }, 200));

        r.running = true;
        view.on("frame", r.animate);
    };

    r.end = function(data) {
        console.log(data);
        r.incoming = r.incoming.concat(data);
    };

    r.die = function(data) {
        r.running = false;
        r.addNotice("Simulation aborted: " + data.error, data.backtrace, data.output);
    }

    r.batch = function(data) {
        r.incoming = r.incoming.concat(data.batch);
    };

    r.clear = function() {
        if (r.channel) r.dispatcher.unbind(r.channel);

        r.running = false;
        view.off("frame");
        for (shell in r.shells) {
            r.shells[shell].die();
            delete r.shells[shell];
        }
        for (tank in r.tanks) {
            r.tanks[tank].object.remove();
            delete r.tanks[tank];
        }
        r.explosions.forEach(function(explosion) {
            explosion.remove();
        });
        r.explosions = [];
        r.lastTick = 0;
        view.update();
    };

    r.setup = function() {
        r.canvas = document.getElementById("tranque-replay");
        r.container = r.canvas.parentNode;
        r.toolbar = document.getElementById("tranque-toolbar");

        $("#replay-notices #toolbar").click(function() {
            $("#replay-notices").toggleClass("visible");
        });
        $("#replay-notices #clear-console").click(function() {
            $("#replay-notices #console .replay-notice").remove();
        });

        if (window.REPLAY_DATA) {
            r.rerun();
        } else {
            r.addNotice("Press the play button to start a simulation!");
        }
    };

    r.simulate = function() {
        r.clear();
        r.addNotice("Running simulation...");
        $.ajax("/matches.json", {
            type: "POST",
            data: {
                match: {
                    tanks: window.MATCH_TANKS,
                    test: true
                }
            },
            dataType: "json",
            success: function(data) {
                r.addNotice("Sending simulation data...");
                r.dispatcher = new WebSocketRails(window.WEBSOCKETS_HOST);
                r.dispatcher.on_open = function() {
                    r.channel = "match."+data.id;
                    r.channel = r.dispatcher.subscribe_private(r.channel);
                    r.channel.bind("start", r.init);
                    r.channel.bind("stop", r.end);
                    r.channel.bind("batch", r.batch);
                    r.channel.bind("error", r.die);
                };
            }
        });
    };

    r.rerun = function() {
        r.clear();
        r.addNotice("Running simulation...");
        r.init(window.REPLAY_DATA.start);
        r.batch(window.REPLAY_DATA);
    };

    return r;
})();

Replay.setup();
