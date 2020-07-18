class HUD {
  constructor(){
    this.imgs = {
      // "hearts": null
    };
    this.currentInventoryIndex = 0;
  }
  loadImgs(){
    for(let img in this.imgs){
      this.imgs[img] = loadImage(`/static/data/interface/${img}.png`);
    }
  }
  render(){
    push();// so the colors don't bleed, and so the text/rect align/mode doesn't bleed
    textAlign(LEFT);
    rectMode(CORNER);
		fill(255,255,255,100);
    noStroke();
		rect(-width/2+20-10, -height/2+10, 250+20, 200)

    // render lives
    // for (let i = 0; i < player.lives; i++){
    //   image(this.imgs.hearts, -width/2+50*(i+1), -height/2+50, 50, 50);
    // }
    fill(0);
    textSize(30);
    // TODO: visual representations for these?
    let txtMsgs = [
      "Level: " + player.level,
      "XP: " + player.xp + " / " + levelupReqXP[player.level],
      "Coins: " + player.coins, 
			"Mana: " + player.mana,
			"Health: " + player.health + " / " + player.maxHealth,
    ]
    for(let i=0; i < txtMsgs.length; i++){
      text(txtMsgs[i], -width/2 + 25, -height/2 + 100+ 25*i);
    }
    noFill();

    rect(-width/2+20, -height/2 + 100, 250, 25);
    // rect(-width/2+20, -height/2 + 125, 250, 25);
    rect(-width/2+20, -height/2 + 150, 250, 25);

    fill(255,0,0,100);
    rect(-width/2+20, -height/2 + 100, 250*player.xp/levelupReqXP[player.level], 25);

    // fill(255,223,0,100);
    // rect(-width/2+20, -height/2 + 125, 250*player.coins/player.coincap, 25);
	
    fill(0,0,255,100);
    rect(-width/2+20, -height/2 + 150, 250*player.mana/player.manacap, 25);

    fill(0,255,0,100);
    rect(-width/2+20, -height/2 + 175, 250*player.health/player.maxHealth, 25);

    pop();
  }
  showLoseScreen(){
    fill(128, 128, 128, 100);
    rect(0,0,width,height);
    fill(0, 255, 255);
    textSize(60);
    text("You Lose", 0, 0);
  }

  nextInventory(){
    inventoryList[this.currentInventoryIndex].hide();
    this.rotateInventory(1);
    inventoryList[this.currentInventoryIndex].show();
  }
  prevInventory(){
    inventoryList[this.currentInventoryIndex].hide();
    this.rotateInventory(-1);
    inventoryList[this.currentInventoryIndex].show();
  }

  rotateInventory(direction) {
    display.clearDescriptionCard();
    this.currentInventoryIndex += direction;
    if (direction == 1 && this.currentInventoryIndex > inventoryList.length-1)
      this.currentInventoryIndex = 0;
    else if (direction == -1 && this.currentInventoryIndex < 0)
      this.currentInventoryIndex = inventoryList.length-1;
  }

  showInventoryObjectInfo(objectId, type) {
    if (type === "quest"){
      $("#infoCardButton").hide();

      let questName = objectId.slice(0, -4);
      let questType = quest_data[questName]["task"]["type"];
      let questSpecies = quest_data[questName]["task"]["species"];
      let questQuantity = quest_data[questName]["task"]["quantity"];
      let questProgress = player.questProgress[questName];
      let description = `${questType} x${questQuantity} ${questSpecies}(s).`;
      description += "<br>Rewards: ";

      if (questProgress === undefined)
        questProgress = 0;

      $("#infoCardTitle").text(`<<${questName}>> (${questProgress}/${questQuantity} ${questType}ed)`);
      if ("xp" in quest_data[questName]["rewards"]) 
        description += `${quest_data[questName]["rewards"]["xp"]} xp`;

      $("#infoCardDescription").html(description);
    }
    else if (type === "item") {
      $("#infoCardButton").show();
      $("#infoCardButton").text("USE");
      let itemName = objectId.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')     // get filename without extension
      itemManager.showInfoName = itemName;
      let itemIndex = itemManager.searchItemIndex(itemName);
      let itemQuantity = player.items[itemIndex]["quantity"];

      $("#infoCardTitle").text("<<" + itemName + ">> x" + itemQuantity);
      $("#infoCardDescription").text(stats["items"][itemName]["description"]);
      $("#infoCardButton").attr("onclick", `itemManager.useItem(itemManager.showInfoName);`);
    }
    else if(type === "shop"){
      $("#infoCardButton").show();
      $("#infoCardButton").text("BUY");
      let itemName = objectId.slice(0, -4)
      itemManager.showInfoName = itemName;
      itemManager.showInfoCost = stats["items"][itemName]["cost"];
			let itemDescription = stats["items"][itemName]["description"];
      $("#infoCardTitle").text("<<" + itemName + ">>");
      $("#infoCardDescription").text(itemDescription);
      $("#infoCardButton").attr("onclick", `dialogue.performTrade();`);
    }
  }

  clearDescriptionCard(){
    $("#infoCardTitle").text("");
    $("#infoCardDescription").html("");
    $("#infoCardButton").hide();
  }

  addShopItem(itemName){
    let itemCost = stats["items"][itemName]["cost"];
    let li = $("<li/>")
      .attr("id", (itemName+"List"))
      .attr("onclick", "display.showInventoryObjectInfo(this.id, 'shop')")
      .text(`$${itemCost} ${itemName}`)
      .appendTo($("#shopList"));
  }

}
