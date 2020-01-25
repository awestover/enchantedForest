class Player extends Entity {
  constructor(xPos, yPos){
    super(xPos, yPos);
    this.level = 0;
    this.xp = 0;
    this.coins = 100;
		this.mana = 100;
		this.mana = 999999;
		this.projectiles = [];
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
		return this.pos.x + this.lastDir * 16 * (arsenal[type]["size"]+3);
	}
	fireballAttack(){
		let type = "fireball";
		if (this.mana >= arsenal[type]["manaCost"])
			this.projectiles.push(new Projectile(type, this.repositionProjectile(this.pos.x, type), this.pos.y));
	}
	coinshotAttack(){
		let type = "coinshot";
		if (this.mana >= arsenal[type]["manaCost"])
			this.projectiles.push(new Projectile(type, this.repositionProjectile(this.pos.x, type), this.pos.y-blockSize/2));
	}

}
