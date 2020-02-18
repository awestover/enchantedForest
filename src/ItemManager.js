class ItemManager {
  constructor(){
		this.showInfoName;
		this.showInfoIndex;
		this.showInfoQuantity;
		this.inInfoMode = false;
  }

	createItem(itemType){
		let itemTable = document.getElementById("itemTable");
		let row;
		if(player.items.length % 5 == 1)
		// if(player.items.length % 2 == 1)
			row = itemTable.insertRow();
		else
			row = itemTable.rows[itemTable.rows.length-1];

		let cell = row.insertCell();
		cell.id = itemType+"ItemCell";
		let img = document.createElement("IMG");
		img.src = "data/items/"+itemType+".png";
    // img.setAttribute("onclick", "player.mana += 10");
    img.setAttribute("onclick", "itemManager.showItemInfo(this.src)");

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

		$.notify(`item \"${itemType}\" acquired!`, "success");
	}

	showItemInfo(itemSrc) {
		// get filename without extension
		let itemName = itemSrc.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')

		$("#itemTable").hide();
		$("#itemInfoPage").show();

		this.showInfoName = itemName;
		this.inInfoMode = true;

		let itemIndex;
		let itemQuantity;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) {
			if (player.items[itemIndex]["type"] === itemName){
				itemQuantity = player.items[itemIndex]["quantity"];
				break;
			}
		}

		// this.showInfoIndex = itemIndex;
		// this.showInfoQuantity = showInfoQuantity;

		$("#itemTitle").text("<<" + itemName + ">> x" + itemQuantity);
		$("#itemDescription").text(stats["items"][itemName]["description"]);
		$("#itemUseButton").attr("onclick", `itemManager.useItem(itemManager.showInfoName);`);
		document.getElementById("portraitImg").src = itemSrc;
	}

	hideItemInfo() {
		$("#itemInfoPage").hide();
		$("#itemTable").show();
		document.getElementById("portraitImg").src = "data/avatars/empty.png";
		this.inInfoMode = false;
	}

	useItem(itemName) {

		console.log("imma use item");
		let itemIndex;
		let itemQuantity;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) {
			if (player.items[itemIndex]["type"] === itemName){
				if (player.items[itemIndex]["quantity"] <= 0)
					return;
				player.items[itemIndex]["quantity"]--;
				itemQuantity = player.items[itemIndex]["quantity"];
				break;
			}
		}
		if (itemIndex == player.items.length)		// item removed/not found
			return;

		$("#itemTitle").text("<<"+itemName+">> x"+(itemQuantity));
		$(("#"+itemName+"ItemCellText")).text((itemQuantity));

		this.applyEffects(itemName);

		if (itemQuantity === 0) {
			this.hideItemInfo();
			player.items.splice(itemIndex, 1);
			$(("#"+itemName+"ItemCell")).remove();
		}
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
		document.getElementById(("quickAccess"+value)).src = stats["items"][this.showInfoName]["imgPaths"];
	}

	quickAccess0() {
		this.useItem(quickAccessItems[0]);
	}
	quickAccess1() {
		this.useItem(quickAccessItems[1]);
	}
	quickAccess2() {
		this.useItem(quickAccessItems[2]);
	}
	quickAccess3() {
		this.useItem(quickAccessItems[3]);
	}
	quickAccess4() {
		this.useItem(quickAccessItems[4]);
	}
	quickAccess5() {
		this.useItem(quickAccessItems[5]);
	}
	quickAccess6() {
		this.useItem(quickAccessItems[6]);
	}
	quickAccess7() {
		this.useItem(quickAccessItems[7]);
	}
	quickAccess8() {
		this.useItem(quickAccessItems[8]);
	}
	quickAccess9() {
		this.useItem(quickAccessItems[9]);
	}

}
