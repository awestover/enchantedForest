function loadRoom(roomName, spawn_loc, spit_direction){
  loadingRoom = true;
	room_load_checklist.push("bg-img");
	room_load_checklist.push("map");
  if (roomName == "bobsTown_tutorial" && !player.completedQuests.includes("tutorial")){
    tutorial_damage_disabled = true;
  }

  $("#questBannerContainer").hide();
  $("#conversationContainer").hide();
  $("#shopContainer").hide();
  display.clearDescriptionCard();
  $(".wrapper").hide();
	username = null;
  currentRoom = roomName;
  data = null;
  mobs = [];
  items = [];
  roomImage = loadImage(`/static/data/maps/rooms/${roomName}/tilemap.png`);
  fallingParticles = [];
  bolts = [];
  $.getJSON(`/static/data/maps/rooms/${roomName}/traits.json`, function(returnData){
    roomTraits = returnData;
    
    if(roomTraits["bg-img"]){
      bgColor = loadImage(`/static/data/maps/rooms/${roomName}/${roomTraits["bg-img"]}`, (result) => {
        bgColor.resize(width, height);
				removeElts(room_load_checklist, "bg-img");
      });
    } 
    else{
      bgColor = color(roomTraits["bg-color"]);
			removeElts(room_load_checklist, "bg-img");
    }

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
          mobs.push(new Mob(bc.x, bc.y-blockSize/2, tile_type));
          mobs[mobs.length-1].spritesheet = stats["mobs"][tile_type].img;
          for(let attr in stats["mobs"][tile_type].attrs){
            mobs[mobs.length-1][attr] = stats["mobs"][tile_type].attrs[attr];
          }
        }

        if(TILE_TYPE_TO_NAMES["item"].includes(TILE_IDS_TO_NAMES[data.layers["items"][y][x]])){
          let tile_type = TILE_IDS_TO_NAMES[data.layers["items"][y][x]].substring(("item"+":").length);
          console.log(stats.items.gem.img);
          items.push(new Item(bc.x, bc.y, tile_type));
        }
      }
    }
		removeElts(room_load_checklist, "map");

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

	$.get("/getusername", {}, (username)=>{
		player.username = username;
		$('#username').text(username);


		if(player.username == "admin"){
			$.notify("ADMIN, special powers being applied (extra health, coins, mana, speed, jump)", "info");
			player.maxHealth = 1000;
			player.health = 1000;
			player.manacap = 5000;
			player.mana = 5000;
			this.coincap = 5000;
			player.coins = 5000;
			player.maxVel.x = 10;
			player.maxVel.y = 7;
		}
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

	$.get("/getdata", {}, (lud)=>{
		console.log(lud);

		// special case data extraction
		currentRoom = lud.checkpoint_room;
		delete lud.checkpoint_room;

    for(let i in lud.items){
			itemManager.createItem(lud.items[i].species);
    }
		delete lud.items;

		// dump the rest of the stuff into player
		for(let trait in lud){
			player[trait] = lud[trait];
		}

		removeElts(init_toload, "loaded_user_data");
	});

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
  if(!tutorial_damage_disabled){
    if (keyCode === KEY_CODE_TABLE["x"])
      player.fireballAttack();
    else if (keyCode === KEY_CODE_TABLE["c"])	
      player.coinshotAttack();
  }
  if (keyCode === KEY_CODE_TABLE["enter"])
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
  try {
    image(bgColor, 0, 0, width, height);
  } catch (e) {
    background(bgColor);
  }

	// yes this is a label, which enables a goto. yes this is sligtly scary
	full_draw_loop:
  if(!loadingRoom){
    ct++;
    if(ct % manaRegenFrames == 0){
      player.mana = min(player.manacap, player.mana+1);
    }

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
            mobs[j].health -= player.projectiles[i].damage;
            if(mobs[j].health <= 0){
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
      if(mobs[i].health > 0){
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
          mobs[i].health = 0;
        }
      }
      else{ // mobs.health <= 0
        mobs[i].die();
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
              $.get("/savedata", JSON.stringify({
                  "checkpoint_room": currentRoom, 
                  "health": player.health, 
                  "coins": player.coins, 
                  "mana": player.mana, 
                  "completedQuests": player.completedQuests, 
                  "level": player.level, 
                  "xp": player.xp, 
                  "items": player.items
              }), ()=>{
                $.notify("save from server finished!!!!");
              });
              $.notify("yo you are at a checkpoint good job!!!!", "success");
              player.spawn();
              break full_draw_loop;
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
								if (cur_teleporter["prereq_quest"] && !player.completedQuests.includes(cur_teleporter["prereq_quest"])){
									$.notify("you must complete a prereq quest before using this teleporter!", "error");
									break;
								}	
                $.notify("spawn_loc: " + "x: "+ spawn_loc.x + "y: " + spawn_loc.y);
                $.notify(`TELEPORTING TO ${new_room} teleporter ${TELEPORTER_NAMES[i]}`);
                loadRoom(new_room, spawn_loc, spit_direction);
								break full_draw_loop;
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
    if(player.xp >= levelupReqXP[player.level])
      player.levelup();

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
		else if(triggered_initial_room_load && init_toload.length == 0 && room_load_checklist.length == 0){
			loadingRoom = false;
			if(first_load){
				first_load = false;
				setInterval(() => {
					goalPos.x = player.pos.x; 
					goalPos.y = player.pos.y;

					const startLoc = posToTileIdx(batpos.x, batpos.y);
					const goalLoc = posToTileIdx(goalPos.x, goalPos.y);
					if(data)
						path = dijkstra(data.layers.collision, startLoc, goalLoc);
					batHeading.mult(0);
				}, 3000);
			}

			if (player && !player.completedQuests.includes("tutorial") && currentRoom === "bobsTown_tutorial"){
				let explanationText = "Bob has always been a humble llama herder. Until one day... the boars attacked his village. <br> And thus, his grand journey of magic and levancy began.<br>Please approach the NPC navigating with &lt;a&gt; and &lt;d&gt; <br> Press &lt;Enter&gt; to talk to them."
				$("#questBannerContainer").show();
				$("#questBannerTitle").text("Hello World!");
				$("#questBannerObjectives").html(explanationText);
				$("#questBannerAcceptButton").focus();
				$("#questBannerAcceptButton").attr("onclick", `dialogue.hideQuestBanner();`);
				$("#questBannerDeclineButton").attr("onclick", `dialogue.hideQuestBanner();`);
			}
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

