function loadRoom(roomName, spawn_loc, spit_direction){
  $("#questBannerContainer").hide();
  $("#conversationContainer").hide();
  $("#shopContainer").hide();
  display.clearDescriptionCard();
  $(".wrapper").hide();
  currentRoom = roomName;
  loadingRoom = true;
  data = null;
  mobs = [];
  roomImage = loadImage(`/static/data/maps/rooms/${roomName}/tilemap.png`);
  fallingParticles = [];
  bolts = [];
  $.getJSON(`/static/data/maps/rooms/${roomName}/traits.json`, function(returnData){
    roomTraits = returnData;
    bgColor = color(roomTraits["bg-color"]);
    if(roomTraits.weather.includes("rain")){
      for(let i = 0; i < 100; i++){
        fallingParticles.push(new Particle("rain"));
      }
    }
    if(roomTraits.weather.includes("thunder")){
      for(let i = 0; i < 2; i++){
        bolts.push(new LightningBolt());
      }
    }
    if(roomTraits.weather.includes("snow")){
      for(let i = 0; i < 100; i++){
        fallingParticles.push(new Particle("snow"));
      }
    }
  });
  $.getJSON(`/static/data/maps/rooms/${roomName}/map.json`, function(returnData){
    data = returnData;
    mapTileDims.x = data.layers.collision[0].length;
    mapTileDims.y = data.layers.collision.length;

    if(!spit_direction){
      spit_direction = 0;
    }
    let physical_spawn_loc = blockCenter(spawn_loc.x, spawn_loc.y);
    physical_spawn_loc.y -= blockSize;
    player.vel.x = Math.abs(player.vel.x) * spit_direction;
    player.pos.x = physical_spawn_loc.x + 2*blockSize*spit_direction; // TODO: mildly sketchy
    player.pos.y = physical_spawn_loc.y;

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
          mobs.push(new Entity(bc.x, bc.y-blockSize/2, tile_type, "mob"));
          mobs[mobs.length-1].spritesheet = stats["mobs"][tile_type].img;
          for(let attr in stats["mobs"][tile_type].attrs){
            mobs[mobs.length-1][attr] = stats["mobs"][tile_type].attrs[attr];
          }
        }

        if(TILE_TYPE_TO_NAMES["item"].includes(TILE_IDS_TO_NAMES[data.layers["items"][y][x]])){
          let tile_type = TILE_IDS_TO_NAMES[data.layers["items"][y][x]].substring(("item"+":").length);
          items.push(new Entity(bc.x, bc.y, tile_type, "item"));
          items[items.length-1].spritesheet = stats["items"][tile_type].img;
        }
      }
    }
    loadingRoom = false;

		if(first_load){
			first_load = false;
			setInterval(() => {
				goalPos.x = player.pos.x; 
				goalPos.y = player.pos.y;

				const startLoc = posToTileIdx(batpos.x, batpos.y);
				const goalLoc = posToTileIdx(goalPos.x, goalPos.y);
				path = dijkstra(data.layers.collision, startLoc, goalLoc);
				batHeading.mult(0);
			}, 3000);
		}

  });
}

function setup(){
  createCanvas(window.innerWidth, window.innerHeight);

  // inserting dijkstras
  batImg = loadImage("/static/data/avatars/transflybird.gif");
  batpos = createVector(3*blockSize,3*blockSize);
  goalPos = createVector((mapTileDims.x-0.5-5)*blockSize, 0.5*blockSize);

  display.loadImgs();
  $.getJSON("/static/data/sprites.json", function(tmpdata){
    sprite_data = tmpdata;
    removeElts(init_toload, "sprites");
    player = new Player(0, +64);
    player.spritesheet = loadImage("/static/data/avatars/bob.png");
  });
  $.getJSON("/static/data/quests.json", function(tmpdata){
    quest_data = tmpdata;
    removeElts(init_toload, "quests");
  });
  $.getJSON("/static/data/npcs.json", function(tmpdata){
    npc_data = tmpdata;
    removeElts(init_toload, "npcs");
  });
  $.getJSON("/static/data/teleporters.json", function(tmpdata){
    teleporter_data = tmpdata;
    removeElts(init_toload, "teleporters");
  });
  for(let section in stats){
    init_toload.push(section);
    $.getJSON(`/static/data/stats/${section}.json`, function(tmpdata){
      stats[section] = tmpdata;
      for(let thing in stats[section]){
        stats[section][thing].img = loadImage(`/static/data/${section}/${thing}.png`);
      }
      removeElts(init_toload, section);
    });
  }

	$.get("/getdata", {}, (lud)=>{
		console.log(lud);
		$.notify("yayyyyy, you logged int", "success");
		loaded_user_data = lud;
		removeElts(init_toload, "loaded_user_data");
		currentRoom = loaded_user_data.checkpoint_room;
		player.health = parseInt(lud.health);
	});

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
  // $("#itemInfoPage").hide();

  for (let i = 0; i < 10; i++) {
    quickAccessItems[i] = null;
  }
}

function checkKeys() {
  if (player.movementLocked)
    return;

  if (keyIsDown(KEY_CODE_TABLE["left"]) || keyIsDown(KEY_CODE_TABLE["a"])){
    player.vel.x = Math.max(player.vel.x-moveAccel, -player.maxVel.x);
    player.lastDir = -1;
  }
  else if (keyIsDown(KEY_CODE_TABLE["right"]) || keyIsDown(KEY_CODE_TABLE["d"])){
    player.vel.x = Math.min(player.vel.x+moveAccel, player.maxVel.x);
    player.lastDir = 1;
  }
  if(keyIsDown(KEY_CODE_TABLE["u"]))
    player.superjump();

  if (keyIsDown(KEY_CODE_TABLE["space"]))
    player.jump();

  if (keyIsDown(KEY_CODE_TABLE["shift"])) {
    player.lockQuickAccess = true;
    for (var i = 0; i < 10; i++) {
      if(keyCode === KEY_CODE_TABLE["0"] + i){
        itemManager.setQuickAccess(i);
      }
    }
  }
}

function keyReleased() {
  if (keyCode === KEY_CODE_TABLE["x"])
    player.fireballAttack();
  else if (keyCode === KEY_CODE_TABLE["c"])	
    player.coinshotAttack();
  else if (keyCode === KEY_CODE_TABLE["enter"])
    dialogue.montage();
  else if (keyCode === KEY_CODE_TABLE["escape"]){
    if (dialogue.currentType === "merchant")
      dialogue.exitShopMenu();
    $(".wrapper").hide();
    display.clearDescriptionCard();
  }
  else if (keyCode === KEY_CODE_TABLE["w"]){
    if (dialogue.currentType != "merchant")
      $(".wrapper").show();
  }
  else if (keyCode === KEY_CODE_TABLE["q"]){
    if (dialogue.currentType != "merchant")
      display.prevInventory();
  }
  else if (keyCode === KEY_CODE_TABLE["e"])	{
    if (dialogue.currentType != "merchant")
      display.nextInventory();
  }
  else if (keyCode === KEY_CODE_TABLE["shift"]){
    setTimeout(()=>{ player.lockQuickAccess = false; }, 500);
  }

  if (player && !player.lockQuickAccess) {
    for (var i = 0; i < 10; i++) {
      if (keyCode === KEY_CODE_TABLE["0"] + i)
        itemManager.quickAccess(i);
    }
  }
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
    if(diff.mag() < player.maxVel.mag()){
      cameraSeeking = false;
    }
    else{
      diff.setMag(player.maxVel.mag());
      cameraPos.add(diff);
    }
  }
  else{
    if(diff.mag() > player.maxVel.mag()*15){
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
    // translate(-player.pos.x, -player.pos.y);
    // translate(-cameraPos.x, -cameraPos.y);
    translate(-player.pos.x, -cameraPos.y);
    image(roomImage, 0, 0, blockSize*mapTileDims.x, blockSize*mapTileDims.y);
    player.render();

    for(let i = 0; i <fallingParticles.length; i++){
      fallingParticles[i].update();
      fallingParticles[i].render();
    }
    windCt += 0.001;
    for(let i = 0; i < bolts.length; i++){
      bolts[i].render();
      if(random() < 0.01){
        bolts[i].spawn();
      }
    }

    player.checkForQuestCompletion();

    // inserting dijkstras
    push();
    translate(batpos.x, batpos.y)
    if(path.length > 0){
      pathProgressCt += 1;
      batpos.add(batHeading);
      if(batHeading.x < 0){
        scale(-1,1);
      }
      if(pathProgressCt >= pathProgressCap){
        pathProgressCt = 0;
        let gotoPoint = blockCenter(path[0].x, path[0].y);
        batHeading = p5.Vector.sub(gotoPoint, batpos).mult(1/pathProgressCap);
        path.splice(0,1);
      }
    }
    image(batImg, 0, 0, blockSize*5, blockSize*5);
    pop();

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
              player.handleMobKill(mobs[j].species); // really just add a field to the json for this...
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
        console.log("PICKED UP A "+items[i].species);
        player.pickupItem(items[i].species);
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
            player.changeHealth(-10);
          }
        }

        if(mobs[i].flies){
          mobs[i].flySeek(player.pos);
        }
        else{
          mobs[i].dumbSeek();
        }

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
      if(data.layers.roomstuff[y][x] != TILE_NAMES_TO_IDS["empty"]){
        if(player.hitBlock(x, y)){
          if(keyIsDown(KEY_CODE_TABLE["enter"])){
            if(data.layers.roomstuff[y][x] == TILE_NAMES_TO_IDS["checkpoint"]){
              $.get("/savedata", {
                  "checkpoint_room": currentRoom, 
                  "health": player.health, 
                  "coins": player.coins, 
                  "mana": player.mana, 
                  "completedQuests": player.completedQuests, 
                  "level": player.level, 
                  "xp": player.xp, 
                  "items": player.items
              }, ()=>{
                $.notify("save from server finished!!!!");
              });

              $.notify("yo you are at a checkpoint good job!!!!", "success"); // TODO: actually do somehting here lol

              // player.changeHealth(player.maxHealth);
              player.spawn();
              return;
            }
          }

          for (let i in TELEPORTER_NAMES) {
            if(data.layers.roomstuff[y][x] == TILE_NAMES_TO_IDS[TELEPORTER_NAMES[i]]){
              const cur_teleporter = teleporter_data[currentRoom][TELEPORTER_NAMES[i]];
              const new_room = cur_teleporter["to"];
              const new_teleporter = teleporter_data[new_room][TELEPORTER_NAMES[i]];
              const spawn_loc = new_teleporter["location_of_this_teleporter"];
              const spit_direction = new_teleporter["spit_direction_for_incoming_user"];
              const automatically_teleports = cur_teleporter["automatically_teleports"];

              if(automatically_teleports || keyIsDown(KEY_CODE_TABLE["up"])){
                if (cur_teleporter["prereq_quest"] && !player.completedQuests.includes(cur_teleporter["prereq_quest"]))
                  return;
                $.notify("spawn_loc: " + "x: "+ spawn_loc.x + "y: " + spawn_loc.y);
                $.notify(`TELEPORTING TO ${new_room} teleporter ${TELEPORTER_NAMES[i]}`);
                loadRoom(new_room, spawn_loc, spit_direction);
                return;
              }
            }
          }
        }
      }
    }

    player.handleMapCollisions();
    player.update();

    if(player.pos.y > blockSize*mapTileDims.y/2){
      player.changeHealth(-10);
      player.spawn();
    }
    if(player.health <= 0)
      lost = true;
    if(player.xp >= levelupReqXP[player.level]){
      player.levelup();
    }

    checkKeys();
    cameraSeek();
    pop(); // outside of this pop, the camera perspective translate doesnt happen, use this for things that you want absolutely positioned

    if (lost)
      display.showLoseScreen();

    if(lastDialogueBoxToShow === null)
      player.movementLocked = false;
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
			loadRoom(currentRoom, {"x": floor(mapTileDims.x/2), "y": floor(mapTileDims.y/2) + 1}); 
    }
  }

  pop(); // translate to screen center is 0,0

  push(); // dont let the font bleed out
  fill(0);
  stroke(0);
  textSize(30);
  smoothedFrameRateEstimate = frameRate()*frameRateSmootherLambda + (1-frameRateSmootherLambda)*smoothedFrameRateEstimate;
  text("FR"+Math.round(smoothedFrameRateEstimate,1), width-100,100);
  pop();
}

