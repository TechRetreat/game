window.throttle = function(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
    deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
};

window.roundTo = function(n, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(n*factor)/factor;
};

window.fixAngle = function(rads) {
    return -rads + Math.PI/2; //but why? :(
};

window.toDegrees = function(angle) {
    return angle / Math.PI * 180;
};

window.toCartesian = function(radius, angle) {
    return new Point(radius*Math.cos(angle), radius*Math.sin(angle));
};


window.int = function(n) {
    return Math.floor(n);
};

window.random = function(low, high) {
    if (high === undefined) {
        high = low;
        low = 0;
    }
    return Math.random() * (high - low) + low;
}

window.hexToRGB = function(hex) {
    var result;
    if (/^#?[a-f\d]{3}$/i.exec(hex)) {
        result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
        for (var i=1; i<=3; i++) {
            result[i] += result[i];
        }
    } else {
        result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
    }
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

window.componentToHex = function(c) {
    var hex = int(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

window.rgbToHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

window.lerp = function(a, b, n) {
    return Math.abs((b - a) * n + a);
};

window.lerpColor = function(beginning, end, percent) {
    var c1 = hexToRGB(beginning);
    var c2 = hexToRGB(end);
    return rgbToHex(
        lerp(c1.r, c2.r, percent),
        lerp(c1.g, c2.g, percent),
        lerp(c1.b, c2.b, percent)
    );
};

window.map = function(v, a1, b1, a2, b2) {
    return (((v-a1) / (b1 - a1)) * (b2 - a2) + a2);
};

function _Scalable(shape) {
    this.shape = shape;
    this.position = shape.position;
    this.lastScale = 1;

    this.transform();
}

_Scalable.prototype = {
    setPosition: function(position) {
        if (position) {
            this.position = new Point(position.x, position.y);
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
    rotate: function(factor) {
        this.shape.rotate(factor);
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

function _Explosion(location, type) {
    this.type = type || "death";
    this.alive = true;
    this.age = 0;
    if (this.type == "death") {
        this.flash = Scalable.new(new Path.Circle({
            center: location,
            radius: 75,
            fillColor: {
                gradient: {
                    stops: [[new RGBColor(1,1,1,1), 0], [new RGBColor(1,1,1,0), 1]],
                    radial: true
                },
                origin: location,
                destination: location + new Point(75, 0)
            }
        }));
    }
    this.particles = [];
    for (var i=0; i<(Explosion.NUM_PARTICLES[this.type]); i++) {
        this.particles.push({
            shape: Scalable.new(new Shape.Circle({
                center: location,
                radius: random(2, 15),
                fillColor: "#FFFFFF"
            })),
            velocity: this.type == "death" ? new Point(random(-1, 1), random(-1, 1)) : new Point(random(-0.2, 0.2), random(-0.2, 0.2)),
            colorOffset: random(0.5, 1)
        });
    }
}

_Explosion.prototype = {
    tick: function() {
        this.age++;
        if (this.age >= Explosion.PARTICLE_LIFE) {
            this.alive = false;
            this.remove();
        } else {
            if (this.flash) this.flash.setOpacity((Explosion.PARTICLE_LIFE-this.age)/Explosion.PARTICLE_LIFE);
            var ageScale = map(this.age, 0, Explosion.PARTICLE_LIFE, 1, 4);
            this.particles.forEach(function(particle) {
                particle.shape.addPosition(particle.velocity + this.type == "death" ? new Point(random(-15, 15)/ageScale, random(-15, 15)/ageScale) : new Point(random(-5, 5)/ageScale, random(-5, 5)/ageScale));
                if (this.type == "death") {
                    particle.shape.scale(map(this.age, 0, Explosion.PARTICLE_LIFE, 1.2, 0.7));
                } else {
                    particle.shape.scale(map(this.age, 0, Explosion.PARTICLE_LIFE, 1.1, 0.7));
                }
                if (this.age*particle.colorOffset/Explosion.PARTICLE_LIFE < 0.5) {
                    particle.shape.fill(lerpColor(Explosion.PARTICLE_COLORS[this.type][0], Explosion.PARTICLE_COLORS[this.type][1], map(this.age*particle.colorOffset, 0, Explosion.PARTICLE_LIFE/2, 0, 1)));
                } else {
                    particle.shape.fill(lerpColor(Explosion.PARTICLE_COLORS[this.type][1], Explosion.PARTICLE_COLORS[this.type][2], map(this.age*particle.colorOffset, Explosion.PARTICLE_LIFE/2, Explosion.PARTICLE_LIFE, 0, 1)));
                }
                particle.shape.setOpacity((Explosion.PARTICLE_LIFE-this.age)/Explosion.PARTICLE_LIFE);
            }.bind(this));
        }
    },
    transform: function() {
        if (this.flash) this.flash.transform();
        this.particles.forEach(function(particle) {
            particle.shape.transform();
        });
    },
    remove: function() {
        if (this.flash) this.flash.remove();
        this.particles.forEach(function(particle) {
            particle.shape.remove();
        });
    }
}


window.Explosion = (function() {
    var e = {};
    e.PARTICLE_LIFE = 30;
    e.NUM_PARTICLES = {
        "death": 30,
        "damage": 5
    };
    e.PARTICLE_COLORS = {
        "death": ["#FFFF44", "#FF9900", "#888888"],
        "damage": ["#DD7711", "#999999", "#888888"]
    };

    e.new = function(location, type) {
        return new _Explosion(location, type);
    };

    return e;
})();
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

    s.SPEED_FACTOR = 4.5;

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

    r.unread = 0;

    r.transformPoint = function(point) {
        return new Point(point.x*r.scale + r.arena.bounds.left, point.y*r.scale + r.arena.bounds.top);
    };

    r.transformLength = function(l) {
        return l*r.scale;
    };

    r.addNotice = function(text, showConsole, backtrace, output) {
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
        if(showConsole) {
            $("#replay-notices").addClass("visible");
            r.unread = 0;
            $("#unread").text(r.unread);
        }
        notice.appendTo("#replay-notices #console");
        $("#replay-notices #console").scrollTop($("#replay-notices #console")[0].scrollHeight);

        var logNotice = $("<div class='log-notice'></div>").text(text)
        logNotice.appendTo("#log-console");

        if(!$("#replay-notices").hasClass("visible")) {
            r.unread ++;
            $("#unread").text(r.unread);
            $("#unread").addClass("bold-unread");
        }
    };

    r.clearNotices = function() {
        $("#replay-notices").removeClass("visible");
    };

    r.adjustSize = function() {
        if (!r.arena) return;
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
        if (!r.running) {
            if (r.explosions.length == 0 && Object.keys(r.shells).length == 0) {
                view.off("frame");
                $("#endgame").show();
                r.addNotice("End of simulation - press play again to run another!", false);
                return;
            }
            r.interpolateObjects();
        }

        var lastTickUsed = 0;
        if (r.incoming.length > 0 && (!r.incoming[0].tick || r.incoming[0].tick <= r.lastTick+1)) {
            data = r.incoming.shift();
            lastTickUsed = data.tick;
            r.interpolateObjects();
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
                    r.addNotice(tankData.name + ": " + log, false);
                  });
                }
                if (tankData.hasOwnProperty("error") && tankData.error !== null) {
                  r.addNotice(tankData.name + ": Health penalty from error '" + tankData.error.message + "'", true, tankData.error.backtrace);
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
        }
    };

    r.setRanks = function(ranks) {
        $("#tanks").empty();
        var header = $("<tr><th>Tank</th><th>Points</th></tr>").appendTo("#tanks");
        ranks.forEach(function(entry) {
            var row = $("<tr></tr>");
            var name = $("<td></td>").text(entry.name).appendTo(row);
            var name = $("<td></td>").text(entry.score).appendTo(row);
            row.appendTo("#tanks");
        });
    };

    r.init = function(setup) {

        //Hide loading spinner
        $(".spinner").hide();

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
        r.incoming = r.incoming.concat(data);
    };

    r.die = function(data) {
        r.running = false;
        r.addNotice("Simulation aborted: " + data.error, true, data.backtrace, data.output);
    }

    r.batch = function(data) {
        r.incoming = r.incoming.concat(data.batch);
    };

    r.ranks = function(data) {
        r.setRanks(data.ranks);
    };

    r.clear = function() {
        if (r.channel) {
            r.channel.destroy();
            r.channel = undefined;
        }

        r.running = false;
        view.off("frame");
        $("#endgame").hide();
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
        r.incoming = [];
        r.lastTick = 0;
        view.update();
    };

    r.setup = function() {
        r.canvas = document.getElementById("tranque-replay");
        r.container = r.canvas.parentNode;
        r.toolbar = document.getElementById("tranque-toolbar");

        $("#replay-notices #toolbar").click(function() {
            $("#replay-notices").toggleClass("visible");
            r.unread = 0;
            $("#unread").text(r.unread);
            $("#unread").removeClass("bold-unread");
        });
        $("#replay-notices #clear-console").click(function() {
            $("#replay-notices #console .replay-notice").remove();
        });

        if (window.REPLAY_DATA) {
            r.rerun();
        } else {
            r.addNotice("Press the play button to start a simulation!", false);
        }
    };

    r.simulate = function() {
        r.clear();
        r.addNotice("Running simulation...", false);
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
                r.addNotice("Sending simulation data...", false);
                //Show loading spinner
                $(".spinner").show();
                r.dispatcher = new WebSocketRails(window.WEBSOCKETS_HOST);
                r.dispatcher.on_open = function() {
                    r.channel = r.dispatcher.subscribe_private("match."+data.id);
                    r.channel.bind("start", r.init);
                    r.channel.bind("stop", r.end);
                    r.channel.bind("ranks", r.ranks);
                    r.channel.bind("batch", r.batch);
                    r.channel.bind("error", r.die);
                };
            }
        });
    };

    r.rerun = function() {
        r.clear();
        r.setRanks(window.REPLAY_DATA.ranks);
        r.addNotice("Running simulation...", false);
        r.init(window.REPLAY_DATA.start);
        r.batch(window.REPLAY_DATA);
    };

    return r;
})();

Replay.setup();
