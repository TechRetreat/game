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
            if (this.flash) this.flash.remove();
            this.particles.forEach(function(particle) {
                particle.shape.remove();
            });
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
        this.flash.transform();
        this.particles.forEach(function(particle) {
            particle.shape.transform();
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
