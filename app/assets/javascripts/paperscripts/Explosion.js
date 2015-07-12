window.Explosion = (function() {
    var e = {};
    e.PARTICLE_LIFE = 30;
    e.GRAVITY = new Point(0, 0.1);

    e.makeExplosion = function(location) {
        var expl = {
            alive: true,
            age: 0,
            particles: []
        };
        for (var i=0; i<30; i++) {
            expl.particles.push({
                shape: new Shape.Circle({
                    center: new Point(location),
                    radius: random(2, 15),
                    fillColor: "#FFDD00"
                }),
                velocity: new Point(random(-2, 2), random(-2, 2)),
            });
        }
        expl.tick = function() {
            this.age++;
            if (this.age >= e.PARTICLE_LIFE) {
                this.alive = false;
                this.particles.forEach(function(particle) {
                    particle.shape.remove();
                });
            } else {
                this.particles.forEach(function(particle) {
                    particle.shape.position += particle.velocity + new Point(random(-5, 5), random(-5, 5));
                    particle.shape.scale(map(this.age, 0, e.PARTICLE_LIFE, 1.2, 0.7));
                    if (this.age/e.PARTICLE_LIFE > 0.5) {
                        particle.shape.fillColor = lerpColor("#FFDD00", "#FF0000", map(this.age, e.PARTICLE_LIFE/2, e.PARTICLE_LIFE, 0, 1));
                    } else {
                        particle.shape.fillColor = lerpColor("#FFFFFF", "#FFDD00", map(this.age, 0, e.PARTICLE_LIFE/2, 0, 1));
                    }
                    particle.shape.opacity = this.age/e.PARTICLE_LIFE;
                }.bind(this));
            }
        }
        return expl;
    };

    return e;
})();
