
let snowParticles = [];
let windCt = 0; // cool thought: maybe if this wind is strong enough it should affect the player as well....
function windAtTime(){
  let xSpeed = 3*(Math.pow(sin(windCt), 70)*Math.sign(Math.sin(windCt)));
  return createVector(xSpeed, abs(xSpeed)*0.1);
}

class Particle {
  constructor() {
    this.spawn();
  }
  spawn(){
    this.pos = createVector(random()*width, (random()-1)*height/4);
    this.vel = createVector((random()-0.5)*0.25, 1.25+random()*0.5);
    this.r = random()*4 + 3;
    this.mass = Math.pow(this.r, 1.5) * 0.2;
  }
  render(){
    noStroke();
    fill(255,250,250); // snow #fffafa
    ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
  }
  update(){
    this.pos.add(p5.Vector.mult(this.vel, this.mass));
    this.pos.add(p5.Vector.mult(windAtTime(), this.mass));
    if(this.pos.y > height){
      this.spawn();
    }
  }
}

function setup(){
  createCanvas(1024,1024);
  for(let i = 0; i <100; i++){
    snowParticles.push(new Particle());
  }
}

function draw(){
  background(0);
  for(let i = 0; i <100; i++){
    snowParticles[i].update();
    snowParticles[i].render();
  }
  windCt += 0.001;
}

