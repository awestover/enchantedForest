
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
    // fill(255,250,250); // snow #fffafa
    // ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
    //
    fill(175,195,204); // rain #afc3cc
    ellipse(this.pos.x, this.pos.y, this.r/5, this.r*2);
  }
  update(){
    this.pos.add(p5.Vector.mult(this.vel, this.mass));
    this.pos.add(p5.Vector.mult(windAtTime(), this.mass));
    if(this.pos.y > height){
      this.spawn();
    }
  }
}

let blockSize = 32;

let bolts = [];
class LightningBolt{
  constructor(origin,parentAngle,branchPr,length){
    this.spawn(origin,parentAngle,branchPr,length);
  }
  spawn(origin,parentAngle,branchPr,length){
    this.children = [];
    this.segments = [];
    this.length = length || 28;
    this.lives = 28;
    this.branchPr = branchPr || 0.2;
    this.seed = random()*1000;
    this.origin = origin || createVector(random()*width, 0);
    this.segments.push(this.origin);
    this.angleDirection = parentAngle+Math.sign(random()-0.5)*PI/6 || (random()-0.5)*PI/4;
    this.direction = createVector(sin(this.angleDirection), cos(this.angleDirection));
    for(let i = 1; i < this.length; i++){
      let tmp = p5.Vector.mult(this.direction,i*blockSize);
      tmp.add(this.origin);
      tmp.x += (noise(i*0.2+this.seed)-0.5)*blockSize*5;
      this.segments.push(tmp);
      if(random() < this.branchPr){
        this.children.push(new LightningBolt(tmp, this.angleDirection, this.branchPr/10, Math.round((this.length-i)*random())));
        this.branchPr *= 0.4;
      }
      this.branchPr*=1.1;
    }
  }
  render(){
    this.lives-=2;
    if(this.lives > -40){
      push();
      for(let i = 0; i < Math.min(this.segments.length - this.lives, this.segments.length-1); i++){
        // stroke(204,204,204,100);
        // strokeWeight(10);
        // line(this.segments[i].x, this.segments[i].y, this.segments[i+1].x, this.segments[i+1].y);
        strokeWeight(4);
        stroke(255);
        line(this.segments[i].x, this.segments[i].y, this.segments[i+1].x, this.segments[i+1].y);
      }
      for(let i = 0; i < this.children.length; i++){
        this.children[i].render();
      }
      pop();
    }
  }
}

function setup(){
  createCanvas(1024,1024);
  for(let i = 0; i <100; i++){
    snowParticles.push(new Particle());
  }
  for(let i = 0; i < 2; i++){
    bolts.push(new LightningBolt());
  }
}

function draw(){
  background(0);
  for(let i = 0; i <100; i++){
    snowParticles[i].update();
    snowParticles[i].render();
  }
  windCt += 0.001;
  for(let i = 0; i < bolts.length; i++){
    bolts[i].render();
    if(random() < 0.01){
      bolts[i].spawn();
    }
  }

}

