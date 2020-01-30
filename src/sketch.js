
const blockSize = 32;
const gravity = 0.2;
const friction = 0.03;
const moveAccel = 0.3;
const jumpImpulse = 7;
const maxVel = new p5.Vector(2.5, jumpImpulse);
const cameraSpeed = 1.2;
const cameraSeekThresh = cameraSpeed * 15;
const cameraUnseekThresh = cameraSpeed;
const collisionTollerence = 0.0001;
const levelupReqXP = [100, 1000, 2000, 4000];

let roomImage;
let data;
let cameraSeeking = false, lost = false;
const TILE_TYPES = ["mob", "npc", "item"];
const DYNAMIC_TILE_TYPES = ["mob", "item"];
let TILE_NAMES_TO_IDS = {}; // {"black": "2", "collision": "1", ...}
let TILE_IDS_TO_NAMES = {}; // {"2": "black", "1": "collision", ...}
let TILE_TYPE_TO_NAMES = {}; // {"item": ["item:gem", "item:potion", ...],...}
let mapTileDims = new p5.Vector(0,0);
let cameraPos = new p5.Vector(0,0);
let player = new Player(0, +64);
let display = new HUD();
let mobs = [], items = [];
let stats = {
  "weapons": {},
  "items": {},
  "mobs": {}
}
let ct = 0;
let manaRegenFrames = 5;

function loadRoom(roomName){
  data = null;
  mobs = [];
  $.getJSON(`data/maps/rooms/${roomName}/map.json`, function(returnData){
    data = returnData;
    mapTileDims.x = data.layers.collision[0].length;
    mapTileDims.y = data.layers.collision.length;

    let tileIds = Object.keys(data.tiles);
    for(let k in tileIds){
      let curName = data.tiles[tileIds[k]].tilename;
      TILE_NAMES_TO_IDS[curName] = tileIds[k];
      TILE_IDS_TO_NAMES[tileIds[k]] = curName;
    }

    for(let tile_name in TILE_NAMES_TO_IDS){
      for(let tile_type in TILE_TYPES){
        if (tile_name.includes(TILE_TYPES[tile_type]+":")){
          try {
            TILE_TYPE_TO_NAMES[TILE_TYPES[tile_type]].push(tile_name);
          } catch (e) {
            TILE_TYPE_TO_NAMES[TILE_TYPES[tile_type]] = [tile_name];
          }
        }
      }
    }

    for(let x = 0; x < mapTileDims.x; x++){
      for(let y = 0; y < mapTileDims.y; y++){
        let bc = blockCenter(x, y);
        if(TILE_TYPE_TO_NAMES["mob"].includes(TILE_IDS_TO_NAMES[data.layers["mobs"][y][x]])){
          let tile_type = TILE_IDS_TO_NAMES[data.layers["mobs"][y][x]].substring(("mob"+":").length);

          mobs.push(new Entity(bc.x, bc.y-blockSize/2));
          mobs[mobs.length-1].imgs = stats["mobs"][tile_type].imgs;
          mobs[mobs.length-1].type = tile_type;
        }

        if(TILE_TYPE_TO_NAMES["item"].includes(TILE_IDS_TO_NAMES[data.layers["items"][y][x]])){
          let tile_type = TILE_IDS_TO_NAMES[data.layers["items"][y][x]].substring(("item"+":").length);
          items.push(new Item(bc.x, bc.y));
          items[items.length-1].imgs = stats["items"][tile_type].imgs;
          items[items.length-1].type = tile_type;
        }
      }
    }

  });
  roomImage = loadImage(`data/maps/rooms/${roomName}/tilemap.png`);
}

function preload(){ // this is called synchronously with setup / draw (i.e. setup and draw won't happen until this is done!)
  display.loadImgs();
  for(let i in stats){
    $.getJSON(`data/stats/${i}.json`, function(tmpdata){
      stats[i] = tmpdata;
      for(let thing in stats[i]){
        stats[i][thing].imgs = [];
        for(let path in stats[i][thing].imgPaths){
          stats[i][thing].imgs.push(loadImage(stats[i][thing].imgPaths[path]));
        }
      }
    });
  }
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight);
  loadRoom("start");

  // all shapes must be specified as (x,y,w,h) [[yay symmetry]]
  // note: for even more symmetry, I'm having 0,0 be the center of everything. woohoo
  // note: you only really have to worry about this at first, after a while you barely will touch it (I think...) -Alek
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);
}

function checkKeys() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)){ // LEFT / A
    player.vel.x = Math.max(player.vel.x-moveAccel, -maxVel.x);
		player.lastDir = -1;
	}
  else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)){ // RIGHT / D
    player.vel.x = Math.min(player.vel.x+moveAccel, maxVel.x);
		player.lastDir = 1;
	}
  if (keyIsDown(32))	// space
    player.jump();
}

function keyReleased() {
	if (keyCode === 88)				// x
		player.fireballAttack();
	else if (keyCode === 67)	// c
		player.coinshotAttack();
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
    ct++;
    if(ct % manaRegenFrames == 0){
      player.mana += 1;
    }

    background(100);
    push();
    translate(-cameraPos.x, -cameraPos.y);
    image(roomImage, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
    player.render();

    for(let i = player.projectiles.length-1; i>=0; i--){
      let proji = player.projectiles[i];
      if(!proji.exist){
        player.projectiles.splice(i, 1);
      }
      else{
        proji.render();
        proji.update();
        for (let j in mobs){
          if(proji.hitRect(mobs[j].pos, mobs[j].dims)){
            mobs[j].lives -= 2;
            proji.exist = false;
            break;
          }
        }
        if(proji.exist){
          if(proji.handleMapCollisions()) { // kill the projectile if it hits a wall, if it still exists continue
            if(proji.offTheGrid()){
              proji.exist = false;
            }
          }
        }
      }
    }

    for(let i=items.length-1; i >= 0; i--){
      items[i].render();
      if(player.hitRect(items[i].pos, items[i].dims)){
        console.log("PICKED UP A "+items[i].type);
        player.pickupItem(items[i].type);
        items.splice(i, 1);
      }
    }


    for(let i=mobs.length-1; i >= 0; i--){
      if(mobs[i].lives > 0){
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
      else{
        mobs.splice(i, 1);
      }
    }

    let showDialogueBox = false;

    let boundingTiles = player.gridBoundingBox();
    for(let i in boundingTiles){
      let x = boundingTiles[i].x;
      let y = boundingTiles[i].y;
      if(data.layers.npcs[y][x] != TILE_NAMES_TO_IDS["empty"]){
        if(player.hitBlock(x, y)){
          if(TILE_TYPE_TO_NAMES["npc"].includes(TILE_IDS_TO_NAMES[data.layers.npcs[y][x]])){
            showDialogueBox = true;
          }
          else if(data.layers.npcs[y][x] == TILE_NAMES_TO_IDS["teleporter"]){
            // this is not scalable, think of a better solution!!! probably something like teleporter:alpha|beta
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

    if (lost)
			display.showLoseScreen();

    if (showDialogueBox) 
			display.showDialogueBox("dog");
		else
			display.clearDialogueBox();

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
