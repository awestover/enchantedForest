const blockSize = 64;
const tiledims = new p5.Vector(16,16);
let batpos;
let batImg;
let goalPos;
let path;

let debug = [];

function preload(){
  batImg = loadImage("transflybird.gif");
}

function setup(){
  createCanvas(blockSize*tiledims.x,blockSize*tiledims.y);
  batpos = createVector(blockSize, height-blockSize); 
  goalPos = createVector((tiledims.x-0.5-5)*blockSize, 0.5*blockSize);
  imageMode(CENTER);
  rectMode(CENTER);
  path = dijkstra();
}

const collision = [
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],

  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 1,1,1,1, 1,1,1,0, 0,0,0,0, 0,0,0,0 ],
  
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,1,1,1, 1,1,1,1, 1,1,0,0 ],

  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ],
  [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ]

];

class Node {
  constructor(xj, yi){
    this.pos = createVector(xj, yi);
    this.best_dist_sofar = Infinity;
    this.heuristic_dist = batpos.dist(getTileCenter(xj,yi));
    this.neighbors = [];
    this.prev = null;
  }
  taxicabDist(other){
    return abs(other.pos.x - this.pos.x) + abs(other.pos.y - this.pos.y);
  }
  getNeighbors(){
    if(this.neighbors.length == 0){
      let offsets = [{"x":0,"y":1},{"x":0,"y":-1},{"x":1,"y":0},{"x":-1,"y":0}];
      for(let i = 0; i < offsets.length; i++){
        let nx = offsets[i].x + this.pos.x; let ny = offsets[i].y + this.pos.y;
        if(nx >= 0 && nx < tiledims.x && ny >= 0 && ny < tiledims.y && // modify this line so that it is a 2x2 block that we are collision checking against  
           !collision[ny][nx]){
          this.neighbors.push(new Node(nx, ny));
        }
      }
    }
    return this.neighbors;
  }

}

function getTileCenter(xj, yi){
  return createVector((xj+0.5)*blockSize, (yi+0.5)*blockSize);
}
function getLowerLeftTile(x, y){
  return createVector(floor(x/blockSize), floor(y/blockSize));
}
function sameLoc(locA, locB){
  return locA.x == locB.x && locA.y == locB.y;
}
// NOTE: its currently crap 
// because IM not using a priority queue
// https://github.com/mourner/tinyqueue
// looks like a nice library to solve this issue (note: it allows you to define your own comparator function which is good)
function dijkstra(){
  debug = [];

  let out_path = [];

  let visited = [];
  let tovisit = [];
  const startLoc = getLowerLeftTile(batpos.x-blockSize, batpos.y-blockSize);
  let start = new Node(startLoc.x, startLoc.y);
  start.best_dist_sofar = 0;
  tovisit.push(start);
  const goalLoc = getLowerLeftTile(goalPos.x, goalPos.y);

  function visitedAlready(vtx){
    for(let i = 0; i < visited.length; i++){
      if(sameLoc(visited[i].pos, vtx.pos))
        return true;
    }
    return false;
  }

  function goingToVisit(vtx){
    for(let i = 0; i < tovisit.length; i++){
      if(sameLoc(tovisit[i].pos, vtx.pos))
        return i;
    }
    return -1;
  }

  while(tovisit.length > 0){
    tovisit.sort(x=>-x.best_dist_sofar-x.heuristic_dist);
    // console.log(tovisit);
    let current = tovisit.pop();
    // console.log("x: "+current.pos.x+" y: "+current.pos.y);
    visited.push(current);
    let neighbors = current.getNeighbors();
    for(let i = 0; i < neighbors.length; i++){
      let vi=neighbors[i];
      if(!visitedAlready(vi)){
        let idx = goingToVisit(vi);
        if(idx == -1)
          tovisit.push(vi);
        else
          vi = tovisit[idx];
        let altDist = current.taxicabDist(vi) + current.best_dist_sofar;
        debug.push([current.pos, vi.pos]);
        if(altDist < vi.best_dist_sofar){
          vi.best_dist_sofar = altDist;
          vi.prev = current;
        }
      }
    }
    if(sameLoc(current.pos, goalLoc)){
      let backwardsHead = current;
      while(!sameLoc(backwardsHead.pos, startLoc)){
        out_path.push(backwardsHead.pos);
        backwardsHead = backwardsHead.prev;
      }
      console.log(visited);
      return out_path.reverse();
    }
  }
  console.log("ERRORR DIJKSTRAS IS BROKENNNNN");
  return [];
}

function draw(){
  background(0);

  fill(0,255,0);
  rect(goalPos.x, goalPos.y, blockSize, blockSize);

  // the collision box is 2x2 tiles, but I like to be able to see the image :)
  image(batImg, batpos.x, batpos.y, blockSize*5, blockSize*5);
  fill(255,0,0);
  stroke(255,0,0);
  ellipse(batpos.x, batpos.y, 5,5);
  noFill();
  rect(batpos.x, batpos.y, 2*blockSize, 2*blockSize);
  stroke(0,0,255);

  fill(0,0,255);
  strokeWeight(10);
  let goalLoc = getTileCenter(...getLowerLeftTile(goalPos.x, goalPos.y).array());
  ellipse(goalLoc.x,goalLoc.y,25,25);
  let aaa = getTileCenter(...getLowerLeftTile(batpos.x-blockSize, batpos.y-blockSize).array());
  let bbb = getTileCenter(path[0].x, path[0].y);
  line(aaa.x, aaa.y, bbb.x, bbb.y);
  for(let i = 0; i < path.length-1; i++){
    let aaa = getTileCenter(path[i].x, path[i].y);
    let bbb = getTileCenter(path[i+1].x, path[i+1].y);
    line(aaa.x, aaa.y, bbb.x, bbb.y);
  }
  strokeWeight(3);
  fill(255,0,0);

  for(let i = 0; i < debug.length; i++){
    let aaa = getTileCenter(debug[i][0].x, debug[i][0].y);
    let bbb = getTileCenter(debug[i][1].x, debug[i][1].y);
    line(aaa.x, aaa.y, bbb.x, bbb.y);
  }

  strokeWeight(1);



  fill(255);
  for (var y = 0; y < collision.length; y++){
    for (var x = 0; x < collision[y].length; x++) {
      if(collision[y][x]){
        rect(x*blockSize, y*blockSize, blockSize, blockSize);
      }
    }
  }

}

function mousePressed(){
  goalPos.x = mouseX; 
  goalPos.y = mouseY;
  path = dijkstra();
}


