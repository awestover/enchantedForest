class Entity {
  constructor(xPos, yPos){
    this.pos = new p5.Vector(xPos, yPos);
    this.vel = new p5.Vector(0,0);
    this.dims = new p5.Vector(32, 64);
		this.lives = 4;
    this.falling = false;
		this.lastDir = 1;
  }

  jump(){
    if (!this.falling){ 
      this.vel.y -= jumpImpulse;
      this.falling = true;
    }
  }

  render(){
    image(oplusImage, this.pos.x, this.pos.y, this.dims.x, this.dims.y);
  }

	// this is a bit more lenient in terms of dy, and a bit stricter in terms of dx than just hitsBlock
	onBlock(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x - bcenter.x;
		let dy = this.pos.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.dims.y/2 - Math.abs(dy);

		if (dy < 0 && xIntersectSize > (1+collisionTollerence)*maxVel.x){
			if(yIntersectSize > -(1+collisionTollerence)*maxVel.y){
				return true;
			}
		}
		return false;

	}

	barrierViolation(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x - bcenter.x;
		let dy = this.pos.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.dims.y/2 - Math.abs(dy);
    let hitdata = {"hit": false, "xfix": 0, "yfix": 0};

		if (xIntersectSize > 0 && yIntersectSize > 0){
			let barelyXCollision = xIntersectSize < maxVel.x*(1+collisionTollerence);
			let barelyYCollision = yIntersectSize < maxVel.y*(1+collisionTollerence);

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
		let dx = this.pos.x - otherpos.x;
		let dy = this.pos.y - otherpos.y;
		let xIntersectSize = otherdims.x/2 + this.dims.x/2 - Math.abs(dx);
		let yIntersectSize = otherdims.y/2 + this.dims.y/2 - Math.abs(dy);
    return xIntersectSize > 0 && yIntersectSize > 0;
	}

	hitBlock(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x - bcenter.x;
		let dy = this.pos.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.dims.y/2 - Math.abs(dy);
    return xIntersectSize > 0 && yIntersectSize > 0;
	}

  update(){
    if(this.falling)
      this.vel.y = Math.min(this.vel.y + gravity, maxVel.y);
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;


    if(!this.falling){ // friction
      if(this.vel.x > 0)
        this.vel.x = Math.max(0, this.vel.x - friction);
      else if(this.vel.x < 0)
        this.vel.x = Math.min(0, this.vel.x + friction);
    }
  }

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
    for (let dx = -1; dx <= 1; dx++){
      if(gx+dx >= 0 && gx + dx < mapTileDims.x){
        for (let dy = -2; dy <= 2; dy++){
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
    return (this.pos.x - this.dims.x*extraTolerance > mapTileDims.x*blockSize/2 || 
       this.pos.x + this.dims.x*extraTolerance < -mapTileDims.x*blockSize/2 || 
       this.pos.y - this.dims.y*extraTolerance > mapTileDims.y*blockSize/2 || 
       this.pos.y + this.dims.y*extraTolerance < -mapTileDims.y*blockSize/2);
  }

}

