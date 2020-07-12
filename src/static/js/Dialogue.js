class Dialogue { // TODO: should maybe have different types of dialogue (e.g. trade dialogude, quest dialogue...)
  constructor(){

    // these parameters are updated whenever you open a new dialogue
    this.inDialogue = false;
    this.dialogueIndex = 0;
    this.script = null;

    this.npcName = "";
    this.currentType = null;

    this.questName = "";
    this.questDetails = null;
    this.tradeData = null;
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
  }

  clearBox(){
    $("#portraitImg").attr("src", "/static/data/avatars/empty.png");
    $("#dialogueTextWrapper").css("display", "none");
    this.inDialogue = false;
    inventoryList[display.currentInventoryIndex].show();
  }
  showBox(){
    $("#conversationContainer").show();
    $("#portraitImg").attr("src", `/static/data/avatars/${this.npcName}.png`);
    $(".wrapper").hide();

    player.movementLocked = true;
    this.inDialogue = true;
    this.dialogueIndex = 0;
    this.currentType = this.npcData.type;
    this.script = this.spliceScript(this.npcName + ": " + this.npcData.dialogue);

    if(this.currentType == "questDealer"){
      this.questName = this.npcData.proposeQuest;
      this.questDetails = {...quest_data[this.npcData.proposeQuest]};
      $("#questBannerAcceptButton").attr("onclick", `dialogue.hideQuestBanner(); player.assignQuest('${this.npcData.proposeQuest}');`);
      $("#questBannerDeclineButton").attr("onclick", `dialogue.hideQuestBanner();`);
    }
    else if(this.currentType == "merchant"){
      this.tradeData = this.npcData.proposeTrade;
    }
    this.montage();
    $("#dialogueTextWrapper").css("display", "inline-block");
  }

  montage(){
    if (lastDialogueBoxToShow === null) {
      $.notify("no npcs near enough to talk to");
      return;
    }
    if(!this.inDialogue && lastDialogueBoxToShow!=null){
      this.showBox();
      return;
    }
    $("#dialogueText").text(this.script[this.dialogueIndex]);
    this.dialogueIndex++;

    // End of dialogue
    if(this.dialogueIndex > this.script.length){
      if (this.currentType === "talker")
        player.movementLocked = false;
      else if(this.currentType === "merchant")
        this.openShopMenu();
      else if(this.currentType === "questDealer"){
        if(!player.quests.includes(this.questName) && 
          !player.completedQuests.includes(this.questName)){
          this.displayQuestBanner();
        }
        else
          player.movementLocked = false;
      }
      else
        player.movementLocked = false;
      $("#conversationContainer").hide();
    }
  }

  openShopMenu(){
    inventoryList[display.currentInventoryIndex].hide();
    $(".wrapper").show();
    $("#shopContainer").show();
    $("#shopHeader").text(this.npcName);
    $("#shopList").html("");
    for (let i = 0; i < this.tradeData.length; i++) 
      display.addShopItem(this.tradeData[i]);
  }

  exitShopMenu(){
    inventoryList[display.currentInventoryIndex].show();
    $("#shopContainer").hide();
    this.currentType = "null";
    player.movementLocked = false;
  }

  spliceScript(fulltext){
    let words = fulltext.split(" ");
    let finaltext = [];
    let currentLength = 0;
    let maxLength = 250;
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

  performTrade(){
    if(player.coins >= itemManager.showInfoCost){
      player.coins -= itemManager.showInfoCost;
      player.pickupItem(itemManager.showInfoName);
    }
    else
      $.notify("Insufficient coins to make the trade!!!");
  }
}
