class QuestSystem {
  constructor(){
  }

	addQuest(quest){
		let li = $("<li/>")
			.attr("id", (quest+"List"))
			.text(quest).
			appendTo($("#questList"));
	}

	removeQuest(quest){
		$("#"+quest+"List").remove();
	}

	showQuestInfo(itemSrc) {
		// get filename without extension
		// let itemName = itemSrc.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')
		// this.showInfoName = itemName;
		// let itemIndex = this.searchItemIndex(itemName);
		// let itemQuantity = player.items[itemIndex]["quantity"];

		$("#questList").hide();
		$("#questInfoPage").show();

		// $("#itemTitle").text("<<" + itemName + ">> x" + itemQuantity);
		// $("#itemDescription").text(stats["items"][itemName]["description"]);
		// $("#itemUseButton").attr("onclick", `itemManager.useItem(itemManager.showInfoName);`);
		// $("#portraitImg").attr('src', itemSrc);
	}

	hideQuestInfo() {
		$("#portraitImg").attr('src', 'data/avatars/empty.png');
		$("#questInfoPage").hide();
		$("#questList").show();
	}

}
