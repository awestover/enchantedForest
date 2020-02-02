class Dialogue {
  constructor(){
		this.inDialogue = false;
		this.dialogueIndex = 0;
		this.npcName = "";
		this.script = null;
  }
	showBox(npcName, npcData){
		$("#dialogueImg").attr("src", `data/avatars/${npcName}.png`);
    let questDetails = JSON.stringify(quest_data[npcData.proposeQuest]); // make this nicer...
		
		this.inDialogue = true;
		this.dialogueIndex = 0;
		this.npcName = npcName;
		this.script = this.spliceScript(npcName + ": " + npcData.dialogue);
		// this.script = this.spliceScript("012345 01234567 789a abcd f e");		// Testing

		this.montage();
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

	montage(){
		if(!this.inDialogue)
			return;
    $("#dialogueText").text(this.script[this.dialogueIndex]);
		this.dialogueIndex++;

		// Optional
		// if(this.dialogueIndex > this.script.length){		// End of dialogue
		//   // show banner?
		//   this.clearBox();
		// }
	}

	clearBox(){
		document.getElementById("dialogueImg").src = "data/avatars/empty.png";
		$("#dialogueTextWrapper").css("display", "none");
		this.inDialogue = false;
	}
}
