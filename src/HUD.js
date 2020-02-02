class HUD {
  constructor(){
    this.imgs = {
      "hearts": null
    };
		this.inDialogue = false;
		this.dialogueIndex = 0;
		this.npcName = "";
		this.script = null;
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
    rect(-width/2+20, -height/2 + 125, 250, 25);
    rect(-width/2+20, -height/2 + 150, 250, 25);
    fill(255,0,0,100);
    rect(-width/2+20, -height/2 + 100, 250*player.xp/levelupReqXP[player.level], 25);
    fill(255,223,0,100);
    rect(-width/2+20, -height/2 + 125, 250*player.coins/player.coincap, 25);
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
	showDialogueBox(npcName, npcData){
		$("#dialogueImg").attr("src", `data/avatars/${npcName}.png`);
    let questDetails = JSON.stringify(quest_data[npcData.proposeQuest]); // make this nicer...
		
		this.inDialogue = true;
		this.dialogueIndex = 0;
		this.npcName = npcName;
		this.script = this.spliceScript(npcName + ": " + npcData.dialogue);
		// this.script = this.spliceScript("012345 01234567 789a abcd f e");		// Testing

		this.dialogueMontage();
    // $("#npcQuest").text(npcData.proposeQuest);
    // $("#npcQuestDetails").text(questDetails);
    $("#dialogueTextButton").attr("onclick", `player.assignQuest('${npcData.proposeQuest}')`);
		$("#dialogueTextWrapper").css("display", "inline-block");
	}

	spliceScript(fulltext){
		let words = fulltext.split(" ");
		let finaltext = [];
		let currentLength = 0;
		let maxLength = 15;
		let tempstr = "";

		for(let i = 0; i < words.length; i++){
			if((currentLength + words[i].length + 1) > maxLength){
				finaltext.push(JSON.parse(JSON.stringify(tempstr)));
				tempstr = "";
				currentLength = 0;
			}
			tempstr += (words[i] + " ");
			currentLength += (words[i].length + 1);
		}
		finaltext.push(JSON.parse(JSON.stringify(tempstr)));
		return finaltext;
	}

	dialogueMontage(){
		if(!this.inDialogue)
			return;
    $("#dialogueText").text(this.script[this.dialogueIndex]);
		this.dialogueIndex++;

		// Optional
		// if(this.dialogueIndex > this.script.length){		// End of dialogue
		//   // show banner?
		//   this.clearDialogueBox();
		// }
	}

	clearDialogueBox(){
		document.getElementById("dialogueImg").src = "data/avatars/empty.png";
		$("#dialogueTextWrapper").css("display", "none");
		this.inDialogue = false;
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
