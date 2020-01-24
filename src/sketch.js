
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
const levelupReqXP = [100, 1000, 2000, 4000];

let roomImage, heartImage, oplusImage;
let data;
let cameraSeeking = false, lost = false;
let TILE_IDS = { }
let mapTileDims = new p5.Vector(0,0);
let cameraPos = new p5.Vector(0,0);
let player = new Player(0, +64);
let display = new HUD();
let mobs = [];
let arsenal = {};

function loadRoom(roomName){
  data = null;
  mobs = [];
  setTimeout(function(){
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

    for(let x = 0; x < mapTileDims.x; x++){
      for(let y = 0; y < mapTileDims.y; y++){
        if(data.layers.mobSpawnPoints[y][x] == TILE_IDS["mob:dino"]){
          let bc = blockCenter(x, y);
          mobs.push(new Entity(bc.x, bc.y-blockSize/2));
        }
      }
    }
  });
  roomImage = loadImage("data/maps/rooms/"+roomName+"/tilemap.png");
  }, 250);
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight);
  loadRoom("start");
	heartImage = loadImage("data/interface/hearts.png");
	oplusImage = loadImage("data/avatars/oplus.png");

	$.getJSON( "data/stats/arsenal.json", function( arsenalStats ) {
		Object.assign(arsenal, arsenalStats);
		arsenal["fireball"]["img"] = loadImage("data/attacks/fireball.png");
	});

  // all shapes must be specified as (x,y,w,h) [[yay symmetry]]
  // note: for even more symmetry, I'm having 0,0 be the center of everything. woohoo
  // note: you only really have to worry about this at first, after a while you barely will touch it (I think...) -Alek
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);
}

function checkKeys() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65))// LEFT / A
    player.vel.x = Math.max(player.vel.x-moveAccel, -maxVel.x);
  else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68))  // RIGHT / D
    player.vel.x = Math.min(player.vel.x+moveAccel, maxVel.x);
  if (keyIsDown(32))	// space
    player.jump();
}

function keyReleased() {
	if (keyCode === 88)	// x
		player.fireballAttack();
}

function blockCenter(x, y){
  return createVector(blockSize*(x+0.5-mapTileDims.x/2), blockSize*(y+0.5-mapTileDims.y/2));
}

function cameraSeek(){
  let diff = p5.Vector.sub(player.pos, cameraPos);

  /// ugh thresholding is !!super!! jerky, make a funciton that is less steep
  //than a step function that still prevents the jiggling when the camera is on
  //the user
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
  push();
  translate(width/2, height/2);

  if(data){ 
    background(100);
    push();
    translate(-cameraPos.x, -cameraPos.y);
    image(roomImage, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
    player.render();

		player.projectiles.forEach(function(projectile, index){
			if (projectile.exist){
				projectile.render();
				projectile.handleMapCollisions();
				projectile.update();
			}
		});

    for(let i in mobs){
      mobs[i].render();

      // dumb seeking
      // mobs[i].vel.x = Math.sign(player.pos.x - mobs[i].pos.x)*maxVel.x;
      // randomly move
      if(Math.random() < 0.05)
        mobs[i].jump();
      if(Math.random() < 0.1){
        if(mobs[i].vel.x != 0){
          if(Math.random() < 0.9){
            mobs[i].vel.x = Math.sign(mobs[i].vel.x)*maxVel.x;
          }
          else{
            mobs[i].vel.x = -Math.sign(mobs[i].vel.x)*maxVel.x;
          }
        }
        else{
            mobs[i].vel.x = Math.sign(Math.random() - 0.5)*maxVel.x;
        }
      }
      // I guess I should really do a hybrid of seeking and random motion based on players position?
      mobs[i].handleMapCollisions();
      mobs[i].update();
    }

    let showFakeDialogueBox = false;

    let boundingTiles = player.gridBoundingBox();
    for(let i in boundingTiles){
      let x = boundingTiles[i].x;
      let y = boundingTiles[i].y;
      if(data.layers.agents[y][x] != TILE_IDS["empty"]){
        if(player.hitBlock(x, y)){
          if(data.layers.agents[y][x] == TILE_IDS["npc:dog"]){
            // trigger dialogue box
            showFakeDialogueBox = true;
          }
          else if(data.layers.agents[y][x] == TILE_IDS["teleporter"]){
            // lol this is kinda dumb, think of a better solution later
            loadRoom("alpha");
            return;
          }
        }
      }
    }

    player.handleMapCollisions();
    player.update();

    if(player.pos.y > blockSize*mapTileDims.y/2){
      player.lives -= 1;
      player.spawn();
      if(player.lives <= 0)
        lost = true;
    }
    if(player.xp >= levelupReqXP[player.level]){
      player.levelup();
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
      rect(0,height/2 - height/16,width,height/8);
      fill(0);
      textSize(20);
      text("Fake Dialogue Box KEVIN DESIGN THIS,\n note: dialogue box should have a face in it,\n the face of the npc..., \nnote: map.json contains the path to the npcs image...", 0,height/2 - height/16, width,height/8);
    }

    display.render();
  }
  else{
    background(255,0,0);
    textSize(60);
    fill(0,0,0);
    text("LOADING", 0, 0);
  }

  pop(); // translate to screen center is 0,0
}

