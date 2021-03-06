class Player extends Entity {
  constructor(xPos, yPos) {
    super(xPos, yPos, "player");
    this.health = 100;
    this.maxHealth = 100;

    this.level = 0;
    this.xp = 0;
    this.coins = 100;
    this.coincap = 5000;
    this.mana = 100;
    this.manacap = 1000;
    this.projectiles = [];
    this.items = []; // list of {"type": "XX", "quantity": x}
    this.quests = []; // ["gettingStarted", ... ]
    this.questProgress = {}; // "gettingStarted": 5 (mobs killed / potions collected / whatever (if the quest has some numerical thing attached to it, otherwise make this binary))
    this.completedQuests = [];
    this.movementLocked = false;
    this.lockQuickAccess = false;

    this.maxVel.x = 4;
  }

  changeHealth(value){
    let temp = this.health + value;
    if (temp > this.maxHealth)
      this.health = this.maxHealth;
    else if (temp < 0)
      this.health = 0;
    else 
      this.health = temp
  }

	changeCoin(value){
    let temp = this.coins + value;
		this.coins = (temp > this.coincap) ? this.coincap : temp;
	}

  assignQuest(quest){
    if(!this.quests.includes(quest) && !this.completedQuests.includes(quest)){
      for(let i in quest_data[quest].prereqs){
        if(!this.completedQuests.includes(quest_data[quest].prereqs[i])){
          $.notify("error, missing prereqs!")
          return false; 
        }
      }
      this.quests.push(quest);
      this.questProgress[quest] = 0;
      questSystem.addQuest(quest);
      if(quest == "tutorial"){
        // disable damage before talking to NPC
        tutorial_damage_disabled = false;
      }
      $.notify(`new quest ${quest} assigned!`, "success");
    }
    else{
      $.notify("You have already recieved this quest in the past!");
      return false;
    }
  }

  spawn(){
    this.pos.mult(0);
    this.vel.mult(0);
  }
  levelup(){
    this.xp -= levelupReqXP[this.level];
    this.level += 1;
		this.changeCoin(1000);
  }

  handleMobKill(mob_species){
    this.xp += 10;
    for(let i in this.quests){
      let questName = this.quests[i];
      let questType = quest_data[questName].task.type;
      let questQuantity = quest_data[questName]["task"]["quantity"];
      if(questType == "hunt" && quest_data[questName].task.species == mob_species){
        if(this.questProgress.hasOwnProperty(questName)){ // NOTE: this is much nicer than try catch imo :)
          this.questProgress[questName] += 1;
        }
        else {
          this.questProgress[questName] = 1;
        }

        $("#infoCardTitle").text(`<<${questName}>> (${this.questProgress[questName]}/${questQuantity} ${questType}ed)`);
      }
    }
  }

  repositionProjectile(xPos){
    return this.pos.x + this.lastDir * blockSize;
  }
  fireballAttack(){
    let species = "fireball";
    if (this.mana >= stats.weapons[species]["manaCost"])
      this.projectiles.push(new Projectile(this.repositionProjectile(this.pos.x), this.pos.y, species));
  }
  coinshotAttack(){
    let species = "coinshot";
    if (this.mana >= stats.weapons[species]["manaCost"])
      this.projectiles.push(new Projectile(this.repositionProjectile(this.pos.x), this.pos.y-blockSize/2, species));
  }

  pickupItem(itemSpecies){
    for(let i in this.items){
      if(this.items[i].species == itemSpecies){
        this.items[i].quantity += 1;
        itemManager.incrementItem(itemSpecies, this.items[i].quantity);
        return false;
      }
    }
    // if this is an item we don't already have any of
    itemManager.createItem(itemSpecies);
  }

  handleQuestCompletion(quest){
    player.xp += quest_data[quest].rewards.xp;
    questSystem.removeQuest(quest);
  }

  checkForQuestCompletion(){
    for(let i = this.quests.length-1; i >= 0; i--){
      let quest_i = this.quests[i];
      if(this.questProgress[quest_i] >= quest_data[quest_i].task.quantity){
        $.notify(`quest ${quest_i} complete!!`, "success");
        this.completedQuests.push(quest_i);
        this.quests.splice(i,1);
        this.handleQuestCompletion(quest_i);
      }
    }
  }

}
