
const gravity = 0.2;
const moveAccel = 0.3;
const maxXMoveVel = 1.5;
const jumpImpulse = 7;

let playerImg;
let pos = new p5.Vector(0,0);
let vel = new p5.Vector(0,0);
let dims = new p5.Vector(32,64);
let cameraPos = new p5.Vector(0,0);

function checkKeys() {
  if (keyIsDown(LEFT_ARROW)) 
    vel.x = Math.max(vel.x-moveAccel, -maxXMoveVel);
  else if (keyIsDown(RIGHT_ARROW)) 
    vel.x = Math.min(vel.x+moveAccel, maxXMoveVel);
  if (keyIsDown(32)) { // space
    if (vel.y == 0) // if you aren't moving up or down, you must be on some surface, so you are allowed to jump
      vel.y -= jumpImpulse;
  }
}

function cameraSeek(){
  let diff = p5.Vector.sub(pos, cameraPos);
  diff.setMag(1);
  cameraPos.add(diff);
}

function setup(){
  createCanvas(500,500);
  playerImg = loadImage("player.png");
}

function hitBottom(){
  if (pos.y > height/2 - 64)
    return true;
  if (pos.y > height/2 - 64 - 100 -5 &&  pos.y < height/2 - 64 - 100 +5 && pos.x > width/4)
    return true;
  return false;
}

function hitRight(){
  if (pos.x +32 > width/2){
    return true;
  }
  return false;
}

function hitLeft(){
  if (pos.x < -width/2){
    return true;
  }
  return false;
}

function draw(){
  background(0);
  push();
  translate(width/2, height/2);
  translate(-cameraPos.x, -cameraPos.y);

  image(playerImg, pos.x, pos.y, dims.x, dims.y, 0, 0, dims.x, dims.y);

  fill(255);
  rect(width/4, height/2 - 100-5, width/4, 10);

  if(!hitBottom()){
    vel.y += gravity;
  }
  if(hitBottom() && vel.y > 0){
    vel.y = 0;
  }

  if(vel.x > 0 && !hitRight()){
    pos.x += vel.x;
  }
  if(vel.x < 0 && !hitLeft()){
    pos.x += vel.x;
  }

  pos.y += vel.y;
  checkKeys();
  // cameraSeek();
  pop();
}


