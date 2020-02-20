class Dialogue { // TODO: should maybe have different types of dialogue (e.g. trade dialogude, quest dialogue...)
  constructor(){
		this.inDialogue = false;
		this.dialogueIndex = 0;
		this.npcName = "";

		this.questName = "";
		this.questDetails = null;

    this.trade = null;
		this.script = null;

		this.shouldDisplayBanner = false;
  }

	displayTradeBanner(){ // TODO: change the name of the banner stuff so that it's not just for quests
		$("#questBannerContainer").show();
		$("#questBannerTitle").text(`A ${this.trade.item} for ${this.trade.cost} coins`);
		$("#questBannerAcceptButton").focus();
	}

	displayQuestBanner(){
		$("#questBannerContainer").show();
		$("#questBannerTitle").text(`<<${this.questName}>>`);
		if(this.questDetails["task"]["type"] === "hunt"){
			$("#questBannerObjectives").text(`Objective: Hunt x${this.questDetails["task"]["quantity"]} ${this.questDetails["task"]["species"]}`);
		}
		$("#questBannerRewards").text("Rewards: " + this.questDetails["rewards"]["xp"] + " xp");
		$("#questBannerRewards").text(`Rewards: ${this.questDetails["rewards"]["xp"]} xp`);
		$("#questBannerAcceptButton").focus();
	}
	hideQuestBanner(){
		$("#questBannerContainer").hide();
		player.movementLocked = false;
		// this.clearBox();
	}

	clearBox(){
		$("#portraitImg").attr("src", "data/avatars/empty.png");
		$("#dialogueTextWrapper").css("display", "none");
		this.inDialogue = false;
		inventoryList[display.currentInventoryIndex].show();
	}
	showBox(){
		inventoryList[display.currentInventoryIndex].hide();
		$("#portraitImg").attr("src", `data/avatars/${this.npcName}.png`);
		
		this.inDialogue = true;
		player.movementLocked = true;
		this.dialogueIndex = 0;

		this.questName = this.npcData.proposeQuest || "";
    if(this.questName.length > 0)
      this.questDetails = {...quest_data[this.npcData.proposeQuest]};

    this.trade = this.npcData.proposeTrade;

		this.script = this.spliceScript(this.npcName + ": " + this.npcData.dialogue);
		// this.script = this.spliceScript("012345 01234567 789a abcd f e");		// Testing

		this.montage();
    if(this.questName.length > 0){
      $("#questBannerAcceptButton").attr("onclick", `player.assignQuest('${this.npcData.proposeQuest}'); dialogue.hideQuestBanner();`);
      $("#questBannerDeclineButton").attr("onclick", `dialogue.hideQuestBanner();`);
    }
    else if(this.trade !== null){
			this.shouldDisplayBanner = true;
      $("#questBannerAcceptButton").attr("onclick", `dialogue.performTrade(${JSON.stringify(this.npcData.proposeTrade)}); dialogue.hideQuestBanner();`);
      $("#questBannerDeclineButton").attr("onclick", `dialogue.hideQuestBanner();`);
    }
		$("#dialogueTextWrapper").css("display", "inline-block");
	}

	montage(){
		if(!this.inDialogue && lastDialogueBoxToShow!=null){
			this.showBox();
			return;
		}
    $("#dialogueText").text(this.script[this.dialogueIndex]);
		this.dialogueIndex++;

		// End of dialogue
		if(this.dialogueIndex > this.script.length){
      if(this.questName.length > 0){
        if(!player.quests.includes(this.questName) && 
          !player.completedQuests.includes(this.questName)){
          this.displayQuestBanner();
        }
      }
      else if(this.trade !== null && this.shouldDisplayBanner){
        this.displayTradeBanner();
				this.shouldDisplayBanner = false;
      }
		}
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

  performTrade(data){
    if(player.coins >= data.cost){
      player.coins -= data.cost;
      player.pickupItem(data.item);
    }
    else{
      $.notify("Insufficient coins to make the trade!!!");
    }
  }
}
