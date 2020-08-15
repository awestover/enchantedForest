class Item extends Entity {
  constructor(xPos, yPos, itemType) {
    super(xPos, yPos, itemType, "item");
    this.loadSpriteSheet();
  }
  loadSpriteSheet(){
    this.spritesheet = stats["items"][this.type].img;
  }
}

