class Projectile extends Entity{
  constructor(xPos, yPos, species){
    super(xPos, yPos, species, "projectile");
    this.friendly = true;
    this.exist = true;
    this.dir = player.lastDir; // what if mobs have projectiles... -> add this as a todo to the readme
    this.lastDir = this.dir;

    this.damage = stats.weapons[this.species].damage;
    this.spritesheet = stats.weapons[this.species].img;
    this.vel = new p5.Vector(stats.weapons[this.species]["velocity"]*this.dir, 0);
    this.health = -1;
    player.mana -= stats.weapons[this.species]["manaCost"];
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
