class HUD {
  constructor(){
  }
  render(){
    push();// just so the colors don't bleed
    textAlign(LEFT);

    // render lives
    for (let i = 0; i < player.lives; i++){
      image(heartImage, -width/2+50*(i+1), -height/2+50, 50, 50);
    }
    fill(0);
    textSize(30);
    // TODO: visual representations for these?
    let txtMsgs = [
      "Level: " + player.level,
      "XP: " + player.xp + " / " + levelupReqXP[player.level],
      "Coins: " + player.coins, 
			"Mana: " + player.mana,
      "inventory: " + JSON.stringify(player.items)
    ]
    for(let i=0; i < txtMsgs.length; i++){
      text(txtMsgs[i], -width/2 + 25, -height/2 + 100+ 25*i);
    }

    pop();
  }
	showLoseScreen(){
		fill(128, 128, 128, 100);
		rect(0,0,width,height);
		fill(0, 255, 255);
		textSize(60);
		text("You Lose", 0, 0);
	}
	showDialogueBox(npcName){
		document.getElementById("dialogueImg").setAttribute("src","data/avatars/"+npcName+".png");
		document.getElementById("dialogueText").innerHTML = "DIS DE NPC DAWG<br> note: dialogue box should have a face in it,<br> the face of the npc..., <br>note: map.json contains the path to the npcs image...";
	}
	clearDialogueBox(){
		document.getElementById("dialogueImg").setAttribute("src","data/avatars/empty.png");
		document.getElementById("dialogueText").innerHTML = "";
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

		let text = document.createTextNode("1");
		let div = document.createElement("div");
		div.className = "inventorySubscript";
		div.id = itemType+"InventoryCellText";
		div.appendChild(text);

		cell.appendChild(img);
		cell.appendChild(div);
	}
	incrementInventory(itemType, itemQuantity){
		let idName = itemType+"InventoryCellText";
		document.getElementById(idName).childNodes[0].nodeValue = itemQuantity.toString();
	}
}
