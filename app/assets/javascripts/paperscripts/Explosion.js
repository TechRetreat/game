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
