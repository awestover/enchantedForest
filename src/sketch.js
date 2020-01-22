
const blockSize = 32;
const gravity = 0.2;
const friction = 0.03;
const moveAccel = 0.3;
const jumpImpulse = 7;
const maxVel = new p5.Vector(1.5, jumpImpulse);
const cameraSpeed = 1.2;
const cameraSeekThresh = cameraSpeed * 15;
const cameraUnseekThresh = cameraSpeed;
let cameraSeeking = false;
let falling = false;
const collisionTollerence = 0.0001; 

let TILE_IDS = { }

let data;
let mapTileDims = new p5.Vector(0,0);
$.getJSON('data/tilemap/map.json', function(returnData){ 
  data = returnData; 
  let tileIds = Object.keys(data.tiles);
  for(let k in tileIds){
    let curName = data.tiles[tileIds[k]].tilename;
    TILE_IDS[curName] = tileIds[k];
    mapTileDims.x = data.layers.platforms[0].length;
    mapTileDims.y = data.layers.platforms.length;
  }
});
let bg;

class Entity {
  constructor(){
    this.pos = new p5.Vector(0,0);
    this.vel = new p5.Vector(0,0);
    this.dims = new p5.Vector(32, 64);
  }
  render(){
    fill(0,255,0);
    rect(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
  }
}

let player = new Entity();
player.pos.y -= 100;

let cameraPos = new p5.Vector(0,0);

function setup(){
  createCanvas(512,512);
  bg = loadImage("data/tilemap/tilemap.png");

  // all shapes must be specified as (x,y,w,h)
  // yay symmetry
  // note: for even more symmetry, I'm having 0,0 be the center of everything. woohoo
  // note: you only really have to worry about this at first, after a while you barely will touch it (I think...)
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);
}

function checkKeys() {
  if (keyIsDown(LEFT_ARROW)) 
    player.vel.x = Math.max(player.vel.x-moveAccel, -maxVel.x);
  else if (keyIsDown(RIGHT_ARROW)) 
    player.vel.x = Math.min(player.vel.x+moveAccel, maxVel.x);
  if (keyIsDown(32)) { // space
    if (!falling){ 
      player.vel.y -= jumpImpulse;
      falling = true;
    }
  }
}

function blockCenter(x, y){
  return createVector(blockSize*(x+0.5-mapTileDims.x/2), blockSize*(y+0.5-mapTileDims.y/2));
}

// this is a bit more lenient in terms of dy, and a bit stricter in terms of dx than just hitsBlock
function onBlock(x, y){
  let bcenter = blockCenter(x, y);
  let dx = player.pos.x - bcenter.x;
  let dy = player.pos.y - bcenter.y;
  let xIntersectSize = blockSize/2 + player.dims.x/2 - Math.abs(dx);
  let yIntersectSize = blockSize/2 + player.dims.y/2 - Math.abs(dy);

  if (dy < 0 && xIntersectSize > (1+collisionTollerence)*maxVel.x){
    if(yIntersectSize > -(1+collisionTollerence)*maxVel.y){
      return true;
    }
  }
  return false;

}

function hitsBlock(x, y){
  let bcenter = blockCenter(x, y);
  let dx = player.pos.x - bcenter.x;
  let dy = player.pos.y - bcenter.y;
  let xIntersectSize = blockSize/2 + player.dims.x/2 - Math.abs(dx);
  let yIntersectSize = blockSize/2 + player.dims.y/2 - Math.abs(dy);

  if (xIntersectSize > 0 && yIntersectSize > 0){
    let barelyXCollision = xIntersectSize < maxVel.x*(1+collisionTollerence);
    let barelyYCollision = yIntersectSize < maxVel.y*(1+collisionTollerence);

    if(barelyXCollision && !barelyYCollision){ // left/right border violation
      return {"hit": "x", "fix": Math.sign(dx)*xIntersectSize};
    }
    else if(!barelyXCollision && barelyYCollision){ // top/bottom border violation
      return {"hit": "y", "fix": Math.sign(dy)*yIntersectSize};
    }
  }
  return {"hit": false, "fix": null};
  
}

/*
 * this is really temporary code!!!
 */

function hitBottom(){
  if (player.pos.y > height/2 - 32)
    return true;
  return false;
}

function hitRight(){
  if (player.pos.x +32 > width/2){
    return true;
  }
  return false;
}

function hitLeft(){
  if (player.pos.x < -width/2){
    return true;
  }
  return false;
}
// delete these weird things once the real collision detection is up and running 


function cameraSeek(){
  let diff = p5.Vector.sub(player.pos, cameraPos);

  /// ugh thresholding is !!super!! jerky, make a funciton that is less steep than a step function that still prevents the jiggling when the camera is on the user
  // tbh toggligng parameters on this is also kinda low key a viable strategy
  // ok, basically it only looks weird if the player is moving slower than the camera(?)
  if(cameraSeeking){
    if(diff.mag() < cameraUnseekThresh){
      cameraSeeking = false;
    }
    else{
      diff.setMag(cameraSpeed);
      cameraPos.add(diff);
    }
  }
  else{
    if(diff.mag() > cameraSeekThresh){
      cameraSeeking = true;
    }
  }
}

function draw(){
  background(0);
  push();
  translate(width/2, height/2);
  translate(-cameraPos.x, -cameraPos.y);
  image(bg, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
  player.render();

  let onAnyBlock = false;
  for(let x = 0; x < mapTileDims.x; x++){
    for(let y = 0; y < mapTileDims.y; y++){
      if(data.layers.platforms[y][x] == TILE_IDS["collision"]){
        onAnyBlock = onAnyBlock || onBlock(x, y);
        let hitdata = hitsBlock(x, y);
        if(hitdata.hit == "x"){
          player.pos.x += hitdata.fix;
          if(Math.sign(player.vel.x) != Math.sign(hitdata.fix)){
            player.vel.x = 0;
          }
        }
        else if(hitdata.hit == "y"){
          if(Math.sign(hitdata.fix) < 0 && player.vel.y >= 0){ // hits top surface of a block
            falling = false;
          }
          player.pos.y += hitdata.fix;
          if(Math.sign(player.vel.y) != Math.sign(hitdata.fix)){
            player.vel.y = 0;
          }
        }
      }
    }
  }

  if (!onAnyBlock)
    falling = true

  if(falling)
    player.vel.y = Math.min(player.vel.y + gravity, maxVel.y);
  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;


  if(player.vel.x > 0){
    player.vel.x = Math.max(0, player.vel.x - friction);
  }
  else if(player.vel.x < 0){
    player.vel.x = Math.min(0, player.vel.x + friction);
  }

  checkKeys();
  cameraSeek();
  pop();
}




