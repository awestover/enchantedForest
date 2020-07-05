class QuestSystem {

  addQuest(quest){
    let li = $("<li/>")
      .attr("id", (quest+"List"))
      .attr("onclick", "display.showInventoryObjectInfo(this.id, 'quest')")
      .text(quest).
      appendTo($("#questList"));
  }

  removeQuest(quest){
    $("#"+quest+"List").remove();
  }

}
