class Player extends Entity {
  constructor(xPos, yPos){
    super(xPos, yPos);
    this.level = 0;
    this.xp = 0;
    this.coins = 100;
		this.mana = 100;
		this.mana = 999999;
		this.projectiles = [];
    this.items = []; // list of {"type": "XX", "quantity": x}
  }
  render(){
    fill(0,255,0);
    rect(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
  }
  spawn(){
      this.pos.mult(0);
      this.vel.mult(0);
  }
  levelup(){
    this.level += 1;
    this.xp = 0;
    this.coins += 1000;
  }

	repositionProjectile(xPos, type){
		return this.pos.x + this.lastDir * 16 * (stats.weapons[type]["size"]+3);
	}
	fireballAttack(){
		let type = "fireball";
		if (this.mana >= stats.weapons[type]["manaCost"])
			this.projectiles.push(new Projectile(type, this.repositionProjectile(this.pos.x, type), this.pos.y));
	}
	coinshotAttack(){
		let type = "coinshot";
		if (this.mana >= stats.weapons[type]["manaCost"])
			this.projectiles.push(new Projectile(type, this.repositionProjectile(this.pos.x, type), this.pos.y-blockSize/2));
	}

  pickupItem(itemType){
    for(let i in this.items){
      if(this.items[i].type == itemType){
        this.items[i].quantity += 1;
				display.incrementInventory(itemType, this.items[i].quantity);
				return false;
      }
    }
    // if this is an item we don't already have any of
    this.items.push({"type": itemType, "quantity": 1});
		display.createInventory(itemType);
  }
}
