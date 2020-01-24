class Player extends Entity {
  constructor(xPos, yPos){
    super(xPos, yPos);
    this.level = 0;
    this.xp = 0;
    this.coins = 100;
		this.mana = 100;
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
	fireballAttack(){
		if (this.mana >= arsenal["fireball"]["manaCost"])
			this.projectiles.push(new Projectile("fireball", this.pos.x, this.pos.y+16));
	}
	coinshotAttack(){
		if (this.mana >= arsenal["coinshot"]["manaCost"])
			this.projectiles.push(new Projectile("coinshot", this.pos.x, this.pos.y+16));
	}

}
