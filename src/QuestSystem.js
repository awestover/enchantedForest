class QuestSystem {
  constructor(){
		this.inInfoMode = false;
  }

	addQuest(quest){
		let li = $("<li/>")
			.attr("id", (quest+"List"))
			.attr("onclick", "questSystem.showQuestInfo(this.id)")
			.text(quest).
			appendTo($("#questList"));
	}

	removeQuest(quest){
		$("#"+quest+"List").remove();
	}

	showQuestInfo(questId) {
		this.inInfoMode = true;
		$("#questHeader").hide();
		$("#questList").hide();
		$("#questInfoPage").show();

		let questName = questId.slice(0, -4);
		let questType = quest_data[questName]["task"]["type"];
		let questSpecies = quest_data[questName]["task"]["species"];
		let questQuantity = quest_data[questName]["task"]["quantity"];
		let questProgress = player.questProgress[questName];
		let description = `${questType} x${questQuantity} ${questSpecies}(s).`;
		description += "<br>Rewards: ";

		if (questProgress === undefined)
			questProgress = 0;

		$("#questTitle").text(`<<${questName}>> (${questProgress}/${questQuantity} ${questType}ed)`);
		if ("xp" in quest_data[questName]["rewards"]) 
			description += `${quest_data[questName]["rewards"]["xp"]} xp`;

		$("#questDescription").html(description);
		// $("#portraitImg").attr('src', itemSrc);
	}

	hideQuestInfo() {
		this.inInfoMode = false;
		$("#portraitImg").attr('src', 'data/avatars/empty.png');
		$("#questInfoPage").hide();
		$("#questHeader").show();
		$("#questList").show();
	}

}
