function arrToVec(arr){
  return new p5.Vector(arr[0], arr[1]);
}

class Entity {
  constructor(xPos, yPos, spriteName, spriteType){
    this.pos = new p5.Vector(xPos, yPos);
    this.vel = new p5.Vector(0,0);
    this.maxVel = new p5.Vector(2.5, jumpImpulse);

    this.dims = new p5.Vector(blockSize, blockSize*2);
    try{ this.dims = arrToVec(sprite_data[spriteName].total_dims) || this.dims; } catch {}
    this.collision_dims = this.dims;
    try{ this.collision_dims = arrToVec(sprite_data[spriteName].collision_dims) || this.collision_dims; } catch {}
    this.collision_offset = new p5.Vector(0, 0);
    try{ this.collision_offset = arrToVec(sprite_data[spriteName].collision_offset) || this.collision_offset; } catch {}
    this.numframes = {"cols": 1, "rows": 1}; 
    try{ this.numframes = sprite_data[spriteName].numframes || this.numframes; } catch{}
    this.pixel_dims = this.dims;
    try{ this.pixel_dims = arrToVec(sprite_data[spriteName].pixel_dims) || this.dims} catch{}
    this.tileDimsUpperBound = createVector(Math.max(1,Math.ceil(this.dims.x/blockSize)), Math.max(1,Math.ceil(this.dims.x/blockSize)));

    this.species = spriteName;
    this.type = spriteType;
    this.spritesheet = null;
    this.imgcol = 0;
    this.imgrow = 0;
    this.aniCt = 0;
    this.aniSpeed = 10;

    this.flies = false;
    this.seekPath = [];
    this.seekPathTimer = 0;

    this.lives = 4;
    this.falling = false;
		this.lastDir = 1;
  }

  superjump(){ // note: this can go through stuff... probably not a real feature, rather development tool
    if (!this.falling){ 
      this.vel.y -= 2*jumpImpulse;
      this.falling = true;
    }
  }

  jump(){
    if (!this.falling){ 
      this.vel.y -= jumpImpulse;
      this.falling = true;
    }
  }

  render(){
    push();
    fill(255);
    if(this.type=="mob"){ // health bar
      if(this.lives > 0)
        text(this.lives, this.pos.x, this.pos.y-this.dims.y*0.75);
    }
    pop();
    renderPath(this.seekPath);
    if(this.lastDir == 1){
      this.imgrow = 0;
    }
    else{
      this.imgrow = 1;
    }
    if(this.spritesheet){
      image(this.spritesheet, this.pos.x, this.pos.y, this.dims.x, this.dims.y, this.imgcol*this.pixel_dims.x, this.imgrow*this.pixel_dims.y, this.pixel_dims.x, this.pixel_dims.y);
      this.aniCt += 1;
      if(this.aniCt > this.aniSpeed){
        this.aniCt = 0;
        this.imgcol = (this.imgcol + 1) % this.numframes.cols;
      }
    }
    else{
      fill(0);
      rect(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
    }
  }

	// this is a bit more lenient in terms of dy, and a bit stricter in terms of dx than just hitsBlock
	onBlock(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x + this.collision_offset.x - bcenter.x;
		let dy = this.pos.y + this.collision_offset.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.collision_dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.collision_dims.y/2 - Math.abs(dy);

		if (dy < 0 && xIntersectSize > (1+collisionTollerence)*this.maxVel.x){
			if(yIntersectSize > -(1+collisionTollerence)*this.maxVel.y){
				return true;
			}
		}
		return false;

	}

	barrierViolation(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x + this.collision_offset.x - bcenter.x;
		let dy = this.pos.y + this.collision_offset.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.collision_dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.collision_dims.y/2 - Math.abs(dy);
    let hitdata = {"hit": false, "xfix": 0, "yfix": 0};

		if (xIntersectSize > 0 && yIntersectSize > 0){
			let barelyXCollision = xIntersectSize < this.maxVel.x*(1+collisionTollerence);
			let barelyYCollision = yIntersectSize < this.maxVel.y*(1+collisionTollerence);

			if(barelyXCollision){ // left/right border violation
        hitdata["hit"] = true;
				hitdata["xfix"] = Math.sign(dx)*xIntersectSize;
			}
			if(barelyYCollision){ // top/bottom border violation
        hitdata["hit"] = true;
				hitdata["yfix"] = Math.sign(dy)*yIntersectSize;
			}
		}
		return hitdata; 
	}

	hitRect(otherpos, otherdims){
		let dx = this.pos.x + this.collision_offset.x - otherpos.x;
		let dy = this.pos.y + this.collision_offset.y - otherpos.y;
		let xIntersectSize = otherdims.x/2 + this.collision_dims.x/2 - Math.abs(dx);
		let yIntersectSize = otherdims.y/2 + this.collision_dims.y/2 - Math.abs(dy);
    return xIntersectSize > 0 && yIntersectSize > 0;
	}

	hitBlock(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x + this.collision_offset.x - bcenter.x;
		let dy = this.pos.y + this.collision_offset.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.collision_dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.collision_dims.y/2 - Math.abs(dy);
    return xIntersectSize > 0 && yIntersectSize > 0;
	}

  update(){
    if(this.falling && !this.flies)
      this.vel.y = Math.min(this.vel.y + gravity, this.maxVel.y);
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;


    if(!this.falling){ // friction
      if(this.vel.x > 0)
        this.vel.x = Math.max(0, this.vel.x - friction);
      else if(this.vel.x < 0)
        this.vel.x = Math.min(0, this.vel.x + friction);
    }

    if(this.vel.x != 0)
      this.lastDir = Math.sign(this.vel.x);
  }

  handleMapCollisions(){
    let onAnyBlock = false;
    // let boundingTiles = this.gridBoundingBox();
    let boundingTiles = this.beefyGridBoundingBox(); // testing this...
    for(let i in boundingTiles){
      let x = boundingTiles[i].x;
      let y = boundingTiles[i].y;
      if(data.layers.collision[y][x] == TILE_NAMES_TO_IDS["collision"]){
        onAnyBlock = onAnyBlock || this.onBlock(x, y);
        let hitdata = this.barrierViolation(x, y);
        if(hitdata.hit){
          if(hitdata.xfix != 0){
            this.pos.x += hitdata.xfix;
            if(Math.sign(this.vel.x) != Math.sign(hitdata.xfix))
              this.vel.x = 0;
          }
          if(hitdata.yfix != 0){
            // hits top surface of a block
            if(Math.sign(hitdata.yfix) < 0 && this.vel.y >= 0) 
              this.falling = false;
            this.pos.y += hitdata.yfix;
            if(Math.sign(this.vel.y) != Math.sign(hitdata.yfix))
              this.vel.y = 0;
          }
        }
      }
    }
    if (!onAnyBlock)
      this.falling = true
  }

  // computes the 8 tile indices that are bounding this entity
  // um should be 6
  // this is kind of weird 
  // I was being lazy
  // but if it works...
  gridBoundingBox(){
    let gx = Math.round(this.pos.x / blockSize + mapTileDims.x/2);
    let gy = Math.round(this.pos.y / blockSize + mapTileDims.y/2);
    let tiles = [];
    for (let dx = -this.tileDimsUpperBound.x; dx <= this.tileDimsUpperBound.x; dx++){
      if(gx+dx >= 0 && gx + dx < mapTileDims.x){
        for (let dy = -this.tileDimsUpperBound.y; dy <= this.tileDimsUpperBound.y; dy++){
          if(gy+dy >= 0 && gy + dy < mapTileDims.y){
            tiles.push({"x": gx+dx, "y": gy+dy});
          }
        }
      }
    }
    return tiles;
  }

  beefyGridBoundingBox(){
    let gx = Math.round(this.pos.x / blockSize + mapTileDims.x/2);
    let gy = Math.round(this.pos.y / blockSize + mapTileDims.y/2);
    let tiles = [];
    for (let dx = -this.tileDimsUpperBound.x*2; dx <= this.tileDimsUpperBound.x*2; dx++){
      if(gx+dx >= 0 && gx + dx < mapTileDims.x){
        for (let dy = -this.tileDimsUpperBound.y*2; dy <= this.tileDimsUpperBound.y*2; dy++){
          if(gy+dy >= 0 && gy + dy < mapTileDims.y){
            tiles.push({"x": gx+dx, "y": gy+dy});
          }
        }
      }
    }
    return tiles;
  }

  offTheGrid(){
    let extraTolerance = 5;
    return (this.pos.x + this.collision_offset.x - this.collision_dims.x*extraTolerance > mapTileDims.x*blockSize/2 || 
       this.pos.x + this.collision_offset.x + this.collision_dims.x*extraTolerance < -mapTileDims.x*blockSize/2 || 
       this.pos.y + this.collision_offset.y - this.collision_dims.y*extraTolerance > mapTileDims.y*blockSize/2 || 
       this.pos.y + this.collision_offset.y + this.collision_dims.y*extraTolerance < -mapTileDims.y*blockSize/2);
  }

  dumbSeek(){
      if(Math.random() < 0.001)
        this.jump();
      if(Math.random() < 0.1){
        if(this.vel.x != 0){
          if(Math.random() < 0.9)
            this.vel.x = Math.sign(this.vel.x)*this.maxVel.x;
          else
            this.vel.x = -Math.sign(this.vel.x)*this.maxVel.x;
        }
        else{
            this.vel.x = Math.sign(Math.random() - 0.5)*this.maxVel.x;
        }
      }
  }

  flySeek(playerpos){
    this.seekPathTimer += 1;
    if(this.seekPathTimer % 100 == 0){
      let startLoc = posToTileIdx(this.pos.x, this.pos.y);
      let goalLoc = posToTileIdx(playerpos.x, playerpos.y);
      this.seekPath = dijkstra(data.layers.collision, startLoc, goalLoc);
    }
    if(this.seekPath.length > 0){
      let goalPos = blockCenter(this.seekPath[0].x, this.seekPath[0].y);
      this.vel = p5.Vector.sub(goalPos, this.pos);
      this.vel.setMag(this.maxVel.x);
      if(this.pos.dist(goalPos) < this.maxVel.x*2){
        this.seekPath.splice(0,1);
        if(this.seekPath.length == 0){
          this.vel.mult(0);
        }
      }
    }
  }

}

