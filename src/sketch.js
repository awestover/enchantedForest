
const blockSize = 32;
const gravity = 0.2;
const friction = 0.03;
const moveAccel = 0.3;
const jumpImpulse = 7;
const maxVel = new p5.Vector(2, jumpImpulse);
const cameraSpeed = 1.2;
const cameraSeekThresh = cameraSpeed * 15;
const cameraUnseekThresh = cameraSpeed;
const collisionTollerence = 0.0001; 

let roomImage, heartImage;
let data;
let falling = false, cameraSeeking = false, lost = false;
let TILE_IDS = { }
let mapTileDims = new p5.Vector(0,0);
let cameraPos = new p5.Vector(0,0);
let player = new Entity(0, +64);

function loadRoom(roomName){
  $.getJSON("data/maps/rooms/"+roomName+"/map.json", 
  function(returnData){ 
    data = returnData; 
    let tileIds = Object.keys(data.tiles);
    for(let k in tileIds){
      let curName = data.tiles[tileIds[k]].tilename;
      TILE_IDS[curName] = tileIds[k];
      mapTileDims.x = data.layers.platforms[0].length;
      mapTileDims.y = data.layers.platforms.length;
    }
  });
  roomImage = loadImage("data/maps/rooms/"+roomName+"/tilemap.png");
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight);
  loadRoom("start");
	heartImage = loadImage("data/interface/hearts.png");

  // all shapes must be specified as (x,y,w,h) [[yay symmetry]]
  // note: for even more symmetry, I'm having 0,0 be the center of everything. woohoo
  // note: you only really have to worry about this at first, after a while you barely will touch it (I think...) -Alek
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);
}

function renderLives(){
	for (i = 0; i < player.lives; i++){
		image(heartImage, -width/2+50*(i+1), -height/2+50, 50, 50);
	}
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
  background(100);
  push();
  translate(width/2, height/2);

  push();
  translate(-cameraPos.x, -cameraPos.y);
  image(roomImage, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
  player.render();

  let showFakeDialogueBox = false;
  let onAnyBlock = false;
  for(let x = 0; x < mapTileDims.x; x++){
    for(let y = 0; y < mapTileDims.y; y++){
      if(data.layers.agents[y][x] != TILE_IDS["empty"]){
        if(player.hitBlock(x, y)){
          if(data.layers.agents[y][x] == TILE_IDS["npc:dog"]){
            // trigger dialogue box
            showFakeDialogueBox = true;
          }
          else if(data.layers.agents[y][x] == TILE_IDS["teleporter"]){
            // lol this is kinda dumb, think of a better solution later
            loadRoom("alpha");
          }
        }
      }
      if(data.layers.platforms[y][x] == TILE_IDS["collision"]){
        onAnyBlock = onAnyBlock || player.onBlock(x, y);
        let hitdata = player.barrierViolation(x, y);
        if(hitdata.hit){
          if(hitdata.xfix != 0){
            player.pos.x += hitdata.xfix;
            if(Math.sign(player.vel.x) != Math.sign(hitdata.xfix))
              player.vel.x = 0;
          }
          if(hitdata.yfix != 0){
            // hits top surface of a block
            if(Math.sign(hitdata.yfix) < 0 && player.vel.y >= 0) 
              falling = false;
            player.pos.y += hitdata.yfix;
            if(Math.sign(player.vel.y) != Math.sign(hitdata.yfix))
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


  if(!falling){ // friction
    if(player.vel.x > 0)
      player.vel.x = Math.max(0, player.vel.x - friction);
    else if(player.vel.x < 0)
      player.vel.x = Math.min(0, player.vel.x + friction);
  }

  if(data && player.pos.y > blockSize*mapTileDims.y/2){
    player.lives -= 1;
    if(player.lives <= 0)
      lost = true;
    player.pos.x = 0;
    player.pos.y = 0;
    player.vel.x = 0;
    player.vel.y = 0;
  }

  checkKeys();
  cameraSeek();
  pop(); // outside of this pop, the camera perspective translate doesnt happen, use this for things that you want absolutely positioned

  if (lost){
    fill(128, 128, 128, 100);
    rect(0,0,width,height);
    fill(0, 255, 255);
    textSize(60);
    text("You Lose", 0, 0);
  }

  if (showFakeDialogueBox) {
    fill(128, 128, 128, 100);
    rect(0,height/2 - height/8,width,height/8);
    fill(0, 255, 255);
    textSize(20);
    text("Fake Dialogue Box KEVIN DESIGN THIS,\n note: dialogue box should have a face in it,\n the face of the npc..., \nnote: map.json contains the path to the npcs image...", 0,height/2 - height/8, width,height/8);
  }

	renderLives();
  pop();
}

