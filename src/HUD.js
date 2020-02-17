class HUD {
  constructor(){
    this.imgs = {
      "hearts": null
    };
		this.currentInventoryIndex = 0;
		this.showInfoName;
		this.showInfoIndex;
		this.showInfoQuantity;
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

		let itemQuantity;
		let itemIndex;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) {
			if (player.items[itemIndex]["type"] === itemName){
				itemQuantity = player.items[itemIndex]["quantity"];
				break;
			}
		}

		this.showInfoName = itemName;
		this.showInfoIndex = itemIndex;
		this.showInfoQuantity = itemQuantity;

		$("#itemTitle").text("<<" + itemName + ">> x" + itemQuantity);
		$("#itemDescription").text(stats["items"][itemName]["description"]);
		$("#itemUseButton").attr("onclick", `display.useItem();`);
		document.getElementById("portraitImg").src = itemSrc;
	}

	hideItemInfo() {
		$("#itemInfoPage").hide();
		$("#itemTable").show();
		document.getElementById("portraitImg").src = "data/avatars/empty.png";
	}

	useItem() {
		player.items[this.showInfoIndex]["quantity"]--;
		this.showInfoQuantity--;
		$("#itemTitle").text("<<" + this.showInfoName + ">> x" + (this.showInfoQuantity));
		$(("#"+this.showInfoName+"ItemCellText")).text((this.showInfoQuantity));

		player.lives += 1; 

		if (this.showInfoQuantity === 0) {
			this.hideItemInfo();
			player.items.splice(this.showInfoIndex, 1);
			$(("#"+this.showInfoName+"ItemCell")).remove();
		}
	}

}
