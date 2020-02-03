
class Projectile extends Entity{
  constructor(type, xPos, yPos){
    super(xPos, yPos);
		this.friendly = true;
		this.exist = true;
		this.type = type;
		this.dir = player.lastDir; // what if mobs have projectiles... -> add this as a todo to the readme

    let imgIndex = 0;
		if (stats.weapons[type].imgs.length > 1)
		  imgIndex = (this.dir < 0) ? 0 : 1;

		this.imgs = [stats.weapons[type].imgs[imgIndex]];
		this.size = stats.weapons[type].size;

    this.vel = new p5.Vector(stats.weapons[type]["velocity"]*this.dir, 0);
    this.dims = new p5.Vector(blockSize*this.size, blockSize*this.size);
		this.lives = -1;
		player.mana -= stats.weapons[type]["manaCost"];
  }

  update(){
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

	handleMapCollisions(){
		let onAnyBlock = false;
		let boundingTiles = this.gridBoundingBox();
		for(let i in boundingTiles){
			let x = boundingTiles[i].x;
			let y = boundingTiles[i].y;
			if(data.layers.collision[y][x] == TILE_IDS_TO_NAMES["collision"]){
        if(this.hitBlock(x,y)){
          this.exist = false;
          return false;
        }
			}
		}
    return true;
	}

}
