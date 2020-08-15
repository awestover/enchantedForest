class Mob extends Entity {
  constructor(xPos, yPos, spriteName) {
    super(xPos, yPos, spriteName, "mob");
  }

  die(){
    $.notify("You seem a decent fellow. I hate to die.", "info");
    items.push(new Item(this.pos.x+50, this.pos.y, "potion", "item"));
    items.push(new Entity(this.pos.x+50, this.pos.y, "potion", "item"));
  }

}

