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
}

window.fixAngle = function(rads) {
    return -rads + Math.PI/2; //but why? :(
}

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
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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

function _Explosion(location) {
    this.alive = true;
    this.age = 0;
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
    this.particles = [];
    for (var i=0; i<30; i++) {
        this.particles.push({
            shape: Scalable.new(new Shape.Circle({
                center: location,
                radius: random(2, 15),
                fillColor: "#FFFFFF"
            })),
            velocity: new Point(random(-1, 1), random(-1, 1)),
            colorOffset: random(0.5, 1)
        });
    }
}

_Explosion.prototype = {
    tick: function() {
        this.age++;
        if (this.age >= Explosion.PARTICLE_LIFE) {
            this.alive = false;
            this.flash.remove();
            this.particles.forEach(function(particle) {
                particle.shape.remove();
            });
        } else {
            this.flash.setOpacity((Explosion.PARTICLE_LIFE-this.age)/Explosion.PARTICLE_LIFE);
            var ageScale = map(this.age, 0, Explosion.PARTICLE_LIFE, 1, 4);
            this.particles.forEach(function(particle) {
                particle.shape.addPosition(particle.velocity + new Point(random(-15, 15)/ageScale, random(-15, 15)/ageScale));
                particle.shape.scale(map(this.age, 0, Explosion.PARTICLE_LIFE, 1.2, 0.7));
                if (this.age*particle.colorOffset/Explosion.PARTICLE_LIFE < 0.5) {
                    particle.shape.fill(lerpColor("#FFFF44", "#FF9900", map(this.age*particle.colorOffset, 0, Explosion.PARTICLE_LIFE/2, 0, 1)));
                } else {
                    particle.shape.fill(lerpColor("#FF9900", "#888888", map(this.age*particle.colorOffset, Explosion.PARTICLE_LIFE/2, Explosion.PARTICLE_LIFE, 0, 1)));
                }
                particle.shape.setOpacity((Explosion.PARTICLE_LIFE-this.age)/Explosion.PARTICLE_LIFE);
            }.bind(this));
        }
    },
    transform: function() {
        this.flash.transform();
        this.particles.forEach(function(particle) {
            particle.shape.transform();
        });
    }
}


window.Explosion = (function() {
    var e = {};
    e.PARTICLE_LIFE = 30;

    e.new = function(location) {
        return new _Explosion(location);
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
    var main = new Shape.Rectangle(new Point(-20, -20), new Point(20, 20));
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
    var hatch = new Shape.Circle(new Point(0, 0), 10);
    hatch.fillColor = tintedColor;

    var barrel = new Shape.Rectangle(new Point(0, -2), new Point(30, 2));
    barrel.fillColor = tintedColor;

    this.gun = new Group({
        transformContent: false,
        children: []
    });
    this.gun.pivot = new Point(0, 0);
    this.gun.addChildren([hatch, barrel]);

    this.nameTag = new PointText(new Point(0, 65));
    this.nameTag.justification = "center";
    this.nameTag.fillColor = "#FFF";
    this.nameTag.fontSize = 18;
    this.nameTag.content = this.name;

    this.healthBar = new Path.Line(new Point(-50, 40), new Point(50, 40));
    this.healthBar.pivot = this.healthBar.bounds.leftCenter;
    this.healthBar.strokeColor = "#0F0";
    this.healthBar.strokeWidth = 3;

    var obj = new Group({
        transformContent: false,
        children: []
    });
    obj.addChildren([this.radar, this.body, this.gun, this.healthBar, this.nameTag]);
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
    r.id = 0;
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

    r.addNotice = function(text) {
        var notice = $("<div class='notice'></div>")
            .text(text)
            .click(function() {
                $(this).fadeOut(500,function(){
                    $(this).css({"visibility":"hidden"}).slideUp(function(){
                        $(this).remove();
                    });
                });
            })
            .prependTo("#replay-notices");
        setTimeout(function() {
            if ($.contains(document.documentElement, notice[0])) notice.click();
        }, 2000);
    };

    r.clearNotices = function() {
        $("#replay-notices .notice").each(function() {
            $(this).click();
        });
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
        if (r.running == false && r.explosions.length == 0) {
            view.off("frame");
            r.addNotice("End of simulation - press play again to run another!");
            return;
        }

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

        var lastTickUsed = 0;
        while (r.incoming.length > 0 && (!r.incoming[0].tick || r.incoming[0].tick <= r.lastTick+1)) {
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

            for (tank in r.tanks) {
                r.tanks[tank].move();
            }
        }

        r.explosions.forEach(function(explosion) {
            explosion.tick();
        });
    };

    r.getIDFromURL = function() {
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
        r.clearNotices();

        r.width = setup.width || r.width;
        r.height = setup.height || r.height;
        r.center = new Point(r.width/2, r.height/2);

        r.arena = new Shape.Rectangle(new Point(0, 0), new Point(r.width, r.height));
        r.arena.fillColor = "#444";


        setup.tanks.forEach(function(tank) {
            r.addTank({
                position: tank.position ? new Point(tank.position.x, tank.position.y) : undefined,
                color: tank.color,
                name: tank.name,
                current: tank.id == r.id
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

    r.batch = function(data) {
        r.incoming = r.incoming.concat(data.batch);
    };

    r.clear = function() {
        for (shell in r.shells) {
            r.shells[shell].die();
            delete r.shells[shell];
        }
        for (tank in r.tanks) {
            r.tanks[tank].object.remove();
            delete r.tanks[tank];
        }
        r.lastTick = 0;
        view.update();
    };

    r.setup = function() {
        r.getIDFromURL();
        r.canvas = document.getElementById("tranque-replay");
        r.container = r.canvas.parentNode;
        r.toolbar = document.getElementById("tranque-toolbar");
        r.addNotice("Press the play button to start a simulation!");
    };

    r.simulate = function() {
        r.clear();
        r.addNotice("Running simulation...");
        $.ajax("/matches.json", {
            type: "POST",
            data: {
                match: {
                    tanks: [5, 6, r.id]
                }
            },
            dataType: "json",
            success: function(data) {
                r.addNotice("Sending simulation data...");
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

    return r;
})();

Replay.setup();
