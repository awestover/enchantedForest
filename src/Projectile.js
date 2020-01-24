
class Projectile extends Entity{
  constructor(type, xPos, yPos){
    super(xPos, yPos);
		this.friendly = true;
		this.exist = true;
		this.type = type;
		this.dir = player.lastDir;

		if (arsenal[type]["img"].length > 1)
			var imgIndex = (this.dir < 0) ? 0 : 1;
		else 
			var imgIndex = 0;

		this.image = arsenal[type]["img"][imgIndex];
		this.size = arsenal[type]["size"];

    this.pos = new p5.Vector(xPos, yPos);
    this.vel = new p5.Vector(arsenal[type]["velocity"], 0);
    this.dims = new p5.Vector(64*this.size, 64*this.size);
		this.lives = -1;
    this.falling = false;

		player.mana -= arsenal[type]["manaCost"];
  }

  render(){
		image(this.image, this.pos.x, this.pos.y, this.dims.x, this.dims.y);
  }

  update(){
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
		if(this.vel.x > 0)
			this.vel.x = this.dir * Math.max(0, this.vel.x - friction);
		else if(this.vel.x < 0)
			this.vel.x = Math.min(0, this.vel.x + friction);


		// check if on a barrier or mob
		// if yes, then
		// this.exist = false
  }

	// temporary
	handleMapCollisions(){
		let onAnyBlock = false;
		let boundingTiles = this.gridBoundingBox();
		for(let i in boundingTiles){
			let x = boundingTiles[i].x;
			let y = boundingTiles[i].y;
			if(data.layers.platforms[y][x] == TILE_IDS["collision"]){
				onAnyBlock = onAnyBlock || this.onBlock(x, y);
				let hitdata = this.barrierViolation(x, y);
				if(hitdata.hit){
					this.exist = false;
					return;
				}
			}
		}
	}
}

