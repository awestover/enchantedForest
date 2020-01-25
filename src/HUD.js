class HUD {
  constructor(){
  }
  render(){
    push();// just so the colors don't bleed
    textAlign(LEFT);

    // render lives
    for (let i = 0; i < player.lives; i++){
      image(heartImage, -width/2+50*(i+1), -height/2+50, 50, 50);
    }
    fill(0);
    textSize(30);
    // TODO: visual representations for these?
    let txtMsgs = [
      "Level: " + player.level,
      "XP: " + player.xp + " / " + levelupReqXP[player.level],
      "Coins: " + player.coins, 
			"Mana: " + player.mana,
      "inventory: " + JSON.stringify(player.items)
    ]
    for(let i=0; i < txtMsgs.length; i++){
      text(txtMsgs[i], -width/2 + 25, -height/2 + 100+ 25*i);
    }

    pop();
  }
	showLoseScreen(){
		fill(128, 128, 128, 100);
		rect(0,0,width,height);
		fill(0, 255, 255);
		textSize(60);
		text("You Lose", 0, 0);
	}
	showDialogueBox(npcName){
		fill(128, 128, 128, 100);
		rect(0,height/2 - height/16,width,height/8);
		fill(0);
		textSize(20);
    text(npcName, -width/2+100, height/2 - height/16);
		text("Fake Dialogue Box KEVIN DESIGN THIS,\n note: dialogue box should have a face in it,\n the face of the npc..., \nnote: map.json contains the path to the npcs image...", 0,height/2 - height/16, width,height/8);
	}
}
