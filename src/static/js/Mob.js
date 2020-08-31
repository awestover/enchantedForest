class Mob extends Entity {
  constructor(xPos, yPos, spriteName) {
    super(xPos, yPos, spriteName, "mob");
    this.damage = 10;
  }

  die(){
    $.notify("You seem a decent fellow. I hate to die.", "info");
    items.push(new Item(this.pos.x+Math.random()*50, this.pos.y+Math.random()*50, "potion"));
  }

}

