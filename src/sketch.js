
let data;
$.getJSON('data/tilemap/tilemap.json', function(returnData){ data = returnData; });
let bg;

let playerPos = new p5.Vector(0,0);
let cameraPos = new p5.Vector(0,0);

function setup(){
  createCanvas(512,512);
  bg = loadImage("data/tilemap/tilemap.png");
}

function checkKeys() {
  if (keyIsDown(LEFT_ARROW)) {
    playerPos.x -= 3;
  } 
  else if (keyIsDown(RIGHT_ARROW)) {
    playerPos.x += 3;
  }
  if (keyIsDown(UP_ARROW)) {
    playerPos.y -= 3;
  }
  else if (keyIsDown(DOWN_ARROW)) {
    playerPos.y += 3;
  }
}

function cameraSeek(){
  let diff = p5.Vector.sub(playerPos, cameraPos);
  diff.setMag(1);
  cameraPos.add(diff);
}

function draw(){
  background(0);
  translate(width/2, height/2);
  translate(-cameraPos.x, -cameraPos.y);
  image(bg, 0, 0);
  fill(0,255,0);
  ellipse(playerPos.x, playerPos.y, 10, 10);

  checkKeys();
  cameraSeek();
}

