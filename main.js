const totalParticles = 25000

function initial() {
    // ------------------------------
    // !! this is the interesting part
    // ------------------------------

    // 100% of particles -> form a ring, radius 100, thickness 10
    allParticles
        .shape(ring(100, 10))
        .rotation(1, 0, 0)

    // 50% of particles -> on the surface of a ball, radius 60
    allParticles.get(0.3)
        .shape(ball_surface_uniform(60))
        .rotation(1, 1, 1)

    // 50% of particles -> on the surface of a ball, radius 120
    allParticles.get(0.3)
        .shape(ball_surface_uniform(30))
        .rotation(1, -1, -1)
}

function keyPressed() {
    allParticles.shape(ball_fill(100)).rotation(.1, .4, 0)               // all particles -> inside a ball, radius 100
    allParticles.get(0.8).shape(ball_surface(60))    // 50% of particles -> on the surface of a ball, radius 60
    allParticles.get(0.5).shape(cylider_normall(30))    // 50% of particles -> on the surface of a ball, radius 30
}




// ----------------------------------------------------------------
// Particle Shape Functions
// ----------------------------------------------------------------

function ball_fill(r = 100) {
    return p => {
        const theta = random(360)
        const phi = random(360)
        const r2 = random(r)
        p.setTarget(new Vector3D(
            r2 * sin(theta) * cos(phi),
            r2 * sin(theta) * sin(phi),
            r2 * cos(theta)
        ))
    }
}

function ball_surface(r = 100) {
    return p => {
        const theta = random(360)
        const phi = random(360)
        p.setTarget(new Vector3D(
            r * sin(theta) * cos(phi),
            r * sin(theta) * sin(phi),
            r * cos(theta)
        ))
    }
}
function ball_surface_uniform(r = 100) {
    return (p, i) => {
        const theta = i / particles.length * 720
        const phi = i % 360
        p.setTarget(new Vector3D(
            r * sin(theta) * cos(phi),
            r * sin(theta) * sin(phi),
            r * cos(theta)
        ))
    }
}

function cylider_random(r = 100) {
    return p => {
        let theta = random(360)
        let phi = random(360)
        p.setTarget(new Vector3D(
            r * sin(theta),
            r * cos(theta),
            r * cos(phi)
        ))
    }
}
function cylider_normall(r = 100, l = 100) {
    return p => {
        let theta = Math.floor(random(120)) * 3
        let phi = Math.floor(random(l)) * 3
        p.setTarget(new Vector3D(
            r * sin(theta),
            r * cos(theta),
            r * cos(phi)
        ))
    }
}
function ring(r = 100, r2 = 10) {
    return p => {
        let theta = random(360)
        let target = new Vector3D(
            r2 * sin(theta),
            r2 * cos(theta) + r - r2,
            0
        )
        target.rotateX(random(360))
        p.setTarget(target)
    }

}





// ----------------------------------------------------------------
// Main Draw Loop & Helper Functions
// ----------------------------------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL)
    angleMode(DEGREES)
    stroke(200)
    strokeWeight(.9)
    for (let i = 0; i < totalParticles; i++) new Particle()
    allParticles = new ParticleGroup(particles)
    initial()
}
function draw() {
    background(40)
    orbitControl()
    particles.forEach(p => p.update())
    particles.forEach(p => p.draw())

    if (frameCount % 100 === 0) console.log(frameRate())
}

function applyTo(perc, func) {
    if (perc <= 1) {
        const pars = particles.filter(_ => random() < perc)
        pars.forEach(func)
        return pars
    }
    else if (typeof perc === 'function') particles.filter(perc).forEach(p => func(p))
    else particles.forEach(func)
}



// ----------------------------------------------------------------
// Particle Class - describes each particle behavior and properties
// ----------------------------------------------------------------

let particles = []
class Particle {
    constructor() {
        this.pos = new Vector3D(0, 0, 0)
        this.target = new Vector3D(0, 0, 0)
        this.rotVals = { x: 0, y: 0, z: 0 }
        this.isLerping = false
        particles.push(this)
    }
    setTarget(target) {
        this.target = target
        this.isLerping = true
    }
    update() {
        if (this.isLerping) {
            this.pos.lerp(this.target, 0.05)
            this.target.rotateX(this.rotVals.x)
            this.target.rotateY(this.rotVals.y)
            this.target.rotateZ(this.rotVals.z)
            if (this.pos.distSqrd(this.target) < 15) {
                this.isLerping = false
                this.pos = this.target
            }
        }
        this.pos.rotateX(this.rotVals.x)
        this.pos.rotateY(this.rotVals.y)
        this.pos.rotateZ(this.rotVals.z)
    }
    draw() {
        point(this.pos.x, this.pos.y, this.pos.z)
    }
}

const groups = []
function ParticleGroup(ps) {
    this.particles = ps
    groups.push(this)

    this.get = (perc) => {
        if (typeof perc === 'function') return new ParticleGroup(this.particles.filter(perc))
        if (perc <= 1) return new ParticleGroup(this.particles.filter(_ => random() < perc))
    }
    this.shape = (func) => {
        this.rotation(0, 0, 0)
        this.particles.forEach(p => p.grupShape = this)
        this.particles.forEach(func)
        return this
    }
    this.rotation = (x, y, z) => {
        this.particles.forEach(p => p.rotVals = { x, y, z })
        return this
    }
}





// ----------------------------------------------------------------
// Vector3D Class - simple 3D vector class
// ----------------------------------------------------------------

class Vector3D {
    constructor(x, y, z) {
        this.x = x; this.y = y; this.z = z
    }
    get length() {
        return sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
    }
    distSqrd(v) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2
    }
    rotateX(a) {
        const ny = this.y * cos(a) - this.z * sin(a)
        const nz = this.y * sin(a) + this.z * cos(a)
        this.y = ny
        this.z = nz
        return this
    }
    rotateY(a) {
        const nx = this.x * cos(a) - this.z * sin(a)
        const nz = this.x * sin(a) + this.z * cos(a)
        this.x = nx
        this.z = nz
        return this
    }
    rotateZ(a) {
        const nx = this.x * cos(a) - this.y * sin(a)
        const ny = this.x * sin(a) + this.y * cos(a)
        this.x = nx
        this.y = ny
        return this
    }
    lerp(v, a) {
        this.x = lerp(this.x, v.x, a)
        this.y = lerp(this.y, v.y, a)
        this.z = lerp(this.z, v.z, a)
        return this
    }
}