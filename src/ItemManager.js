class ItemManager {
  constructor(){
		this.showInfoName;
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
		this.updateQuickAccessQuantity(itemType, itemQuantity);
		$.notify(`item \"${itemType}\" acquired!`, "success");
	}

	searchItemIndex(itemName) {
		let itemIndex;
		for (itemIndex = 0; itemIndex < player.items.length; itemIndex++) 
			if (player.items[itemIndex]["type"] === itemName)
				break;
		return itemIndex;
	}

	showItemInfo(itemSrc) {
		// get filename without extension
		let itemName = itemSrc.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.')
		this.inInfoMode = true;
		this.showInfoName = itemName;
		let itemIndex = this.searchItemIndex(itemName);
		let itemQuantity = player.items[itemIndex]["quantity"];

		$("#itemTable").hide();
		$("#itemInfoPage").show();

		$("#itemTitle").text("<<" + itemName + ">> x" + itemQuantity);
		$("#itemDescription").text(stats["items"][itemName]["description"]);
		$("#itemUseButton").attr("onclick", `itemManager.useItem(itemManager.showInfoName);`);
		$("#portraitImg").attr('src', itemSrc);
	}

	hideItemInfo() {
		this.inInfoMode = false;
		$("#portraitImg").attr('src', 'data/avatars/empty.png');
		$("#itemInfoPage").hide();
		$("#itemTable").show();
	}

	useItem(itemName) {
		let itemIndex = this.searchItemIndex(itemName);
		if (itemIndex == player.items.length || player.items[itemIndex]["quantity"] <= 0)
			return;		// item removed/not found

		player.items[itemIndex]["quantity"]--;
		let itemQuantity = player.items[itemIndex]["quantity"];

		$("#itemTitle").text("<<"+itemName+">> x"+(itemQuantity));
		$(("#"+itemName+"ItemCellText")).text((itemQuantity));

		this.updateQuickAccessQuantity(itemName, itemQuantity);
		this.applyEffects(itemName);

		if (itemQuantity === 0) {
			this.hideItemInfo();
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

	quickAccess0() { this.useItem(quickAccessItems[0]); }
	quickAccess1() { this.useItem(quickAccessItems[1]); }
	quickAccess2() { this.useItem(quickAccessItems[2]); }
	quickAccess3() { this.useItem(quickAccessItems[3]); }
	quickAccess4() { this.useItem(quickAccessItems[4]); }
	quickAccess5() { this.useItem(quickAccessItems[5]); }
	quickAccess6() { this.useItem(quickAccessItems[6]); }
	quickAccess7() { this.useItem(quickAccessItems[7]); }
	quickAccess8() { this.useItem(quickAccessItems[8]); }
	quickAccess9() { this.useItem(quickAccessItems[9]); }

}
