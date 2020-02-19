class Particle {
  constructor() {
    this.spawn();
  }
  spawn(){
    this.pos = createVector(1.2*(random()-0.5)*mapTileDims.x*blockSize, (random()-2)*mapTileDims.y*blockSize/2);
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

