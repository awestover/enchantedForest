class ItemManager {
  constructor(){
    this.showInfoName;
    this.showItemCost;
  }

  createItem(itemType){
    let itemTable = document.getElementById("itemTable");
    let row;
    if(player.items.length % 5 == 1)
      row = itemTable.insertRow();
    else
      row = itemTable.rows[itemTable.rows.length-1];

    let cell = row.insertCell();
    cell.id = itemType+"ItemCell";
    let img = document.createElement("IMG");
    img.src = "/static/data/items/"+itemType+".png";
    img.setAttribute("onclick", "display.showInventoryObjectInfo(this.src, 'item')");

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
    this.updateQuickAccessQuantity(itemType, itemQuantity);
    $.notify(`item \"${itemType}\" acquired!`, "success");
  }

  searchItemIndex(itemName) {
    let itemIndex;
    for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) 
      if (player.items[itemIndex].species === itemName)
        break;
    return itemIndex;
  }

  useItem(itemName) {
    let itemIndex = this.searchItemIndex(itemName);
    if (itemIndex == player.items.length || player.items[itemIndex]["quantity"] <= 0)
      return;		// item removed/not found

    player.items[itemIndex]["quantity"]--;
    let itemQuantity = player.items[itemIndex]["quantity"];

    $("#infoCardTitle").text("<<"+itemName+">> x"+(itemQuantity));
    $(("#"+itemName+"ItemCellText")).text((itemQuantity));

    this.updateQuickAccessQuantity(itemName, itemQuantity);
    this.applyEffects(itemName);

    if (itemQuantity === 0) {
      display.clearDescriptionCard();
      player.items.splice(itemIndex, 1);
      $(("#"+itemName+"ItemCell")).remove();
    }
  }

  updateQuickAccessQuantity(itemName, itemQuantity) {
    for (let i = 0; i < quickAccessItems.length; i++) 
      if (quickAccessItems[i] === itemName) 
        $(("#quickAccess"+i)).siblings().text(itemQuantity);
  }

  applyEffects(itemName) {
    try {
      if ("lives" in stats["items"][itemName])
        player.lives += stats["items"][itemName]["lives"];
      if ("mana" in stats["items"][itemName])
        player.mana += stats["items"][itemName]["mana"];
    } catch (e) {}
  }

  setQuickAccess(value) {
    if (value < 0 || value > 9 || value === "" || !(this.showInfoName in stats["items"]))
      return;
    quickAccessItems[value] = this.showInfoName;
    $(("#quickAccess"+value)).attr('src', stats["items"][this.showInfoName]["imgPaths"]);

    let itemIndex = this.searchItemIndex(this.showInfoName);
    let itemQuantity = player.items[itemIndex]["quantity"];
    $(("#quickAccess"+value)).siblings().text(itemQuantity);
  }


  quickAccess(i) { this.useItem(quickAccessItems[i]); }

}
