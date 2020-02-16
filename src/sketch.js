const blockSize = 32;
const gravity = 0.2;
const friction = 0.06;
const moveAccel = 0.3;
const jumpImpulse = 7;
// const maxVel = new p5.Vector(2.5, jumpImpulse);
const maxVel = new p5.Vector(3, jumpImpulse); // for testing
// const cameraSpeed = 1.2;
const cameraSpeed = maxVel.x; // for testing
const cameraSeekThresh = cameraSpeed * 15;
const cameraUnseekThresh = cameraSpeed;
const collisionTollerence = 0.0001;
const levelupReqXP = [
  100, 1000, 2000, 4000,4010,4020,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100
];

let roomImage;
let currentRoom = "start";
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
let dialogue = new Dialogue();
let mobs = [], items = [];
let stats = {
  "weapons": {},
  "items": {},
  "mobs": {}
}
let quest_data = {};
let npc_data = {};
let ct = 0;
let manaRegenFrames = 5;

// inserting dijkstras
let goalPos;
let path = [];
let batpos;
let batImg;

let inventoryList = [];

let lastDialogueBoxToShow = null;
const npcCollisionTolerence = 1.5;

// this makes sure that we load the "asset" jsons before trying to load the world 
let init_toload = []; // names of jsons e.g. "map" (don't give the .json, or the prefix)
let triggered_initial_room_load = false;
let loadingRoom = true;

// don't ask ...
const bgColorOptions = ["#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabebe", "#469990", "#e6beff", "#9A6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9", "#ffffff", "#000000"];
let bgColor = bgColorOptions[Math.floor(Math.random()*bgColorOptions.length)];

function loadRoom(roomName){
	$("#questBannerContainer").hide();
  currentRoom = roomName;
  loadingRoom = true;
  data = null;
  mobs = [];
  roomImage = loadImage(`data/maps/rooms/${roomName}/tilemap.png`);
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
    loadingRoom = false;
  });
}

function removeElts(arr, elt){
  for(let i = arr.length-1; i >= 0; i--){
    if(arr[i] === elt){
      arr.splice(i, 1);
    }
  }
}

String.prototype.chopPrefix = function(prefix){
  return this.substr(this.indexOf(prefix)+prefix.length);
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight);

  // inserting dijkstras
  batImg = loadImage("data/avatars/transflybird.gif");
  batpos = createVector(3*blockSize,3*blockSize);
  goalPos = createVector((mapTileDims.x-0.5-5)*blockSize, 0.5*blockSize);

  display.loadImgs();
  init_toload.push("quests");
  $.getJSON("data/quests.json", function(tmpdata){
    quest_data = tmpdata;
    removeElts(init_toload, "quests");
  });
  init_toload.push("npcs");
  $.getJSON("data/npcs.json", function(tmpdata){
    npc_data = tmpdata;
    removeElts(init_toload, "npcs");
  });
  for(let i in stats){
    init_toload.push(i);
    $.getJSON(`data/stats/${i}.json`, function(tmpdata){
      stats[i] = tmpdata;
      for(let thing in stats[i]){
        stats[i][thing].imgs = [];
        for(let path in stats[i][thing].imgPaths){
          stats[i][thing].imgs.push(loadImage(stats[i][thing].imgPaths[path]));
        }
      }
      removeElts(init_toload, i);
    });
  }

  // all shapes must be specified as (x,y,w,h) [[yay symmetry]]
  // note: for even more symmetry, I'm having 0,0 be the center of everything. woohoo
  rectMode(CENTER);
  imageMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);

	inventoryList.push($("#itemContainer"));
	inventoryList.push($("#questContainer"));

	for (let inventoryElement in inventoryList)
		inventoryList[inventoryElement].hide();
	inventoryList[0].show();
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
  if(keyIsDown(87) || keyIsDown(38)) // W / UP
    player.superjump();
  if (keyIsDown(32))	// space
    player.jump();
}

function keyReleased() {
	if (keyCode === 88)				// x
		player.fireballAttack();
	else if (keyCode === 67)	// c
		player.coinshotAttack();
	else if (keyCode === 13)	// enter
		dialogue.montage();
	else if (keyCode === 81)	// q
		display.prevInventory();
	else if (keyCode === 69)	// e
		display.nextInventory();

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

  if(!loadingRoom){
    ct++;
    if(ct % manaRegenFrames == 0){
      player.mana = min(player.manacap, player.mana+1);
    }

    background(bgColor);
    push();
    translate(-cameraPos.x, -cameraPos.y);
    image(roomImage, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
    player.render();
    player.checkForQuestCompletion();


    // inserting dijkstras
    image(batImg, batpos.x, batpos.y, blockSize*5, blockSize*5);
    noFill();
    rect(batpos.x, batpos.y, blockSize, blockSize);
    stroke(0,0,255);

    if(path.length > 0){
      fill(0,0,255);
      strokeWeight(5);
      let goalIdx = posToTileIdx(goalPos.x, goalPos.y);
      let goalLoc = blockCenter(goalIdx.x, goalIdx.y);
      ellipse(goalLoc.x,goalLoc.y,25,25);
      let aaaa = posToTileIdx(batpos.x, batpos.y);
      let aaa = blockCenter(aaaa.x, aaaa.y);
      let bbb = blockCenter(path[0].x, path[0].y);
      line(aaa.x, aaa.y, bbb.x, bbb.y);
      for(let i = 0; i < path.length-1; i++){
        let aaa = blockCenter(path[i].x, path[i].y);
        let bbb = blockCenter(path[i+1].x, path[i+1].y);
        line(aaa.x, aaa.y, bbb.x, bbb.y);
      }
      strokeWeight(3);
      fill(255,0,0);

      // seek it
      let gotoPoint = path[0];
      path.splice(0,1);
      batpos = blockCenter(gotoPoint.x, gotoPoint.y);

    }

    for(let i = player.projectiles.length-1; i>=0; i--){
      if(!player.projectiles[i].exist){
        player.projectiles.splice(i, 1);
      }
      else{
        player.projectiles[i].render();
        player.projectiles[i].update();
        for (let j in mobs){
          if(player.projectiles[i].hitRect(mobs[j].pos, mobs[j].dims)){
            mobs[j].lives -= 2;
            if(mobs[j].lives <= 0){
              player.handleMobKill(mobs[j].type); // really just add a field to the json for this...
            }
            player.projectiles[i].exist = false;
            break;
          }
        }
        if(player.projectiles[i].exist){
          if(player.projectiles[i].handleMapCollisions()) { // kill the projectile if it hits a wall, if it still exists continue
            if(player.projectiles[i].offTheGrid()){
              player.projectiles[i].exist = false;
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

        // TEMPORARY: impact mobs (all mobs)
        if(mobs[i].hitRect(player.pos, player.dims)){
          if(Math.random() < 0.005){
            $.notify("You've been badly wounded by an impact mob :P");
            player.lives -= 1;
          }
        }

        // dumb seeking
        // mobs[i].vel.x = Math.sign(player.pos.x - mobs[i].pos.x)*maxVel.x;
        // randomly move
        if(Math.random() < 0.0005)
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
        if(mobs[i].pos.y > blockSize*mapTileDims.y/2){
          mobs[i].lives = 0;
        }
      }
      else{
        mobs.splice(i, 1);
      }
    }

    let dialogueBoxToShow = null; // this will turn into e.g. 'dawg' if we are on a dawg

    let boundingTiles = player.gridBoundingBox();
    let beefyBoundingTiles = player.beefyGridBoundingBox(); 

    for(let i in beefyBoundingTiles){
      let x = beefyBoundingTiles[i].x;
      let y = beefyBoundingTiles[i].y;
      if(data.layers.npcs[y][x] != TILE_NAMES_TO_IDS["empty"]){
        if(player.hitRect(blockCenter(x, y), createVector(npcCollisionTolerence*blockSize, npcCollisionTolerence*blockSize))){
          let blockName = TILE_IDS_TO_NAMES[data.layers.npcs[y][x]];
          if(TILE_TYPE_TO_NAMES["npc"].includes(blockName)){
            dialogueBoxToShow = blockName.chopPrefix("npc:");
          }
        }
      }
    }
    for(let i in boundingTiles){
      let x = boundingTiles[i].x;
      let y = boundingTiles[i].y;
      if(data.layers.npcs[y][x] != TILE_NAMES_TO_IDS["empty"]){
        if(player.hitBlock(x, y)){
          if(data.layers.npcs[y][x] == TILE_NAMES_TO_IDS["teleporter"]){
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
    }
    if(player.lives <= 0)
      lost = true;
    if(player.xp >= levelupReqXP[player.level]){
      player.levelup();
    }

    checkKeys();
    cameraSeek();
    pop(); // outside of this pop, the camera perspective translate doesnt happen, use this for things that you want absolutely positioned

    if (lost)
			display.showLoseScreen();

    if(lastDialogueBoxToShow != dialogueBoxToShow){
      lastDialogueBoxToShow = dialogueBoxToShow;
      if (dialogueBoxToShow === null) {
        dialogue.clearBox();
      }
      else{
        try {
					dialogue.npcName = dialogueBoxToShow;
					dialogue.npcData = npc_data[currentRoom][dialogueBoxToShow];
        } catch (e) {
					dialogue.npcName = dialogueBoxToShow;
					dialogue.npcData = {};
        }
      }
    }

    display.render();
  }
  else{
    background(255,0,0);
    textSize(60);
    fill(0,0,0);
    text("LOADING", 0, 0);
    if(!triggered_initial_room_load && init_toload.length == 0){
      triggered_initial_room_load = true;
      loadRoom(currentRoom);
    }
  }

  pop(); // translate to screen center is 0,0

}

function mousePressed(){
  goalPos.x = mouseX-width/2+cameraPos.x; 
  goalPos.y = mouseY-height/2+cameraPos.y;

  const startLoc = posToTileIdx(batpos.x, batpos.y);
  const goalLoc = posToTileIdx(goalPos.x, goalPos.y);
  path = dijkstra(data.layers.collision, startLoc, goalLoc);
}
