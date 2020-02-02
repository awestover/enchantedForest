class HUD {
  constructor(){
    this.imgs = {
      "hearts": null
    };
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

	createInventory(itemType){
		let inventoryTable = document.getElementById("inventoryTable");
		let row;
		if(player.items.length % 5 == 1)
			row = inventoryTable.insertRow();
		else
			row = inventoryTable.rows[inventoryTable.rows.length-1];

		let cell = row.insertCell();
		cell.id = itemType+"InventoryCell";
		let img = document.createElement("IMG");
		img.src = "data/items/"+itemType+".png";
    img.setAttribute("onclick", "player.mana += 10");

		let text = document.createTextNode("1");
		let div = document.createElement("div");
		div.className = "inventorySubscript";
		div.id = itemType+"InventoryCellText";
		div.appendChild(text);

		cell.appendChild(img);
		cell.appendChild(div);

		$.notify(`item \"${itemType}\" acquired!`, "success");
	}
	incrementInventory(itemType, itemQuantity){
		let idName = itemType+"InventoryCellText";
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

}
