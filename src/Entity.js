class Entity {
  constructor(xPos, yPos){
    this.pos = new p5.Vector(xPos, yPos);
    this.vel = new p5.Vector(0,0);
    this.dims = new p5.Vector(32, 64);
		this.lives = 4;
  }

  render(){
    fill(0,255,0);
    rect(this.pos.x, this.pos.y, this.dims.x, this.dims.y);
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

	hitBlock(x, y){
		let bcenter = blockCenter(x, y);
		let dx = this.pos.x - bcenter.x;
		let dy = this.pos.y - bcenter.y;
		let xIntersectSize = blockSize/2 + this.dims.x/2 - Math.abs(dx);
		let yIntersectSize = blockSize/2 + this.dims.y/2 - Math.abs(dy);
    return xIntersectSize > 0 && yIntersectSize > 0;
	}

}

