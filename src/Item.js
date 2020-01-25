class Item extends Entity {
  constructor(xpos, ypos){
    super(xpos, ypos);
    this.dims.x = blockSize;
    this.dims.y = blockSize;
  }

}
