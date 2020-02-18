class HUD {
  constructor(){
    this.imgs = {
      "hearts": null
    };
		this.currentInventoryIndex = 0;
		this.showInfoName;
		this.showInfoIndex;
		this.showInfoQuantity;
		this.inInfoMode = false;
  }
  loadImgs(){
    for(let img in this.imgs){
      this.imgs[img] = loadImage(`data/interface/${img}.png`);
    }
  }
  render(){
    push();// so the colors don't bleed, and so the text/rect align/mode doesn't bleed
    textAlign(LEFT);
    rectMode(CORNER);

    // render lives
    for (let i = 0; i < player.lives; i++){
      image(this.imgs.hearts, -width/2+50*(i+1), -height/2+50, 50, 50);
    }
    fill(0);
    textSize(30);
    // TODO: visual representations for these?
    let txtMsgs = [
      "Level: " + player.level,
      "XP: " + player.xp + " / " + levelupReqXP[player.level],
      "Coins: " + player.coins, 
			"Mana: " + player.mana,
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
    pop();
  }
	showLoseScreen(){
		fill(128, 128, 128, 100);
		rect(0,0,width,height);
		fill(0, 255, 255);
		textSize(60);
		text("You Lose", 0, 0);
	}

	createItem(itemType){
		let itemTable = document.getElementById("itemTable");
		let row;
		if(player.items.length % 5 == 1)
		// if(player.items.length % 2 == 1)
			row = itemTable.insertRow();
		else
			row = itemTable.rows[itemTable.rows.length-1];

		let cell = row.insertCell();
		cell.id = itemType+"ItemCell";
		let img = document.createElement("IMG");
		img.src = "data/items/"+itemType+".png";
    // img.setAttribute("onclick", "player.mana += 10");
    img.setAttribute("onclick", "display.showItemInfo(this.src)");

		let text = document.createTextNode("1");
		let div = document.createElement("div");
		div.className = "itemSubscript";
		div.id = itemType+"ItemCellText";
		div.appendChild(text);

		cell.appendChild(img);
		cell.appendChild(div);

		$.notify(`item \"${itemType}\" acquired!`, "success");
	}
	incrementItem(itemType, itemQuantity){
		let idName = itemType+"ItemCellText";
		document.getElementById(idName).childNodes[0].nodeValue = itemQuantity.toString();

		$.notify(`item \"${itemType}\" acquired!`, "success");
	}

	addQuest(quest){
		let questList = document.getElementById("questList");
		let li = document.createElement("li");
		li.id = quest+"List";
		let text = document.createTextNode(quest);
		li.appendChild(text);
		questList.appendChild(li);
	}

	removeQuest(quest){
		document.getElementById(quest+"List").remove();
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
		this.currentInventoryIndex += direction;
		if (direction == 1 && this.currentInventoryIndex > inventoryList.length-1)
			this.currentInventoryIndex = 0;
		else if (direction == -1 && this.currentInventoryIndex < 0)
			this.currentInventoryIndex = inventoryList.length-1;
	}

	showItemInfo(itemSrc) {
		// get filename without extension
		let itemName = itemSrc.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')

		$("#itemTable").hide();
		$("#itemInfoPage").show();

		this.showInfoName = itemName;
		this.inInfoMode = true;

		let itemIndex;
		let itemQuantity;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) {
			if (player.items[itemIndex]["type"] === itemName){
				itemQuantity = player.items[itemIndex]["quantity"];
				break;
			}
		}

		// this.showInfoIndex = itemIndex;
		// this.showInfoQuantity = showInfoQuantity;

		$("#itemTitle").text("<<" + itemName + ">> x" + itemQuantity);
		$("#itemDescription").text(stats["items"][itemName]["description"]);
		$("#itemUseButton").attr("onclick", `display.useItem(display.showInfoName);`);
		document.getElementById("portraitImg").src = itemSrc;
	}

	hideItemInfo() {
		$("#itemInfoPage").hide();
		$("#itemTable").show();
		document.getElementById("portraitImg").src = "data/avatars/empty.png";
		this.inInfoMode = false;
	}

	useItem(itemName) {

		console.log("imma use item");
		let itemIndex;
		let itemQuantity;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) {
			if (player.items[itemIndex]["type"] === itemName){
				if (player.items[itemIndex]["quantity"] <= 0)
					return;
				player.items[itemIndex]["quantity"]--;
				itemQuantity = player.items[itemIndex]["quantity"];
				break;
			}
		}
		if (itemIndex == player.items.length)		// item removed/not found
			return;

		$("#itemTitle").text("<<"+itemName+">> x"+(itemQuantity));
		$(("#"+itemName+"ItemCellText")).text((itemQuantity));

		this.applyEffects(itemName);

		if (itemQuantity === 0) {
			this.hideItemInfo();
			player.items.splice(itemIndex, 1);
			$(("#"+itemName+"ItemCell")).remove();
		}
	}

	applyEffects(itemName) {
		try {
			if ("lives" in stats["items"][itemName])
				player.lives += stats["items"][itemName]["lives"];
			if ("mana" in stats["items"][itemName])
				player.mana += stats["items"][itemName]["mana"];
		} catch (e) {}
	}

	setQuickAccess(value) {
		if (value < 0 || value > 9 || value === "" || !(this.showInfoName in stats["items"]))
			return;
		quickAccessItems[value] = this.showInfoName;
		document.getElementById(("quickAccess"+value)).src = stats["items"][this.showInfoName]["imgPaths"];
	}

	quickAccess0() {
		this.useItem(quickAccessItems[0]);
	}
	quickAccess1() {
		this.useItem(quickAccessItems[1]);
	}
	quickAccess2() {
		this.useItem(quickAccessItems[2]);
	}
	quickAccess3() {
		this.useItem(quickAccessItems[3]);
	}
	quickAccess4() {
		this.useItem(quickAccessItems[4]);
	}
	quickAccess5() {
		this.useItem(quickAccessItems[5]);
	}
	quickAccess6() {
		this.useItem(quickAccessItems[6]);
	}
	quickAccess7() {
		this.useItem(quickAccessItems[7]);
	}
	quickAccess8() {
		this.useItem(quickAccessItems[8]);
	}
	quickAccess9() {
		this.useItem(quickAccessItems[9]);
	}

}
