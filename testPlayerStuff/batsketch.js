const blockSize = 64;
const tiledims = new p5.Vector(16,16);
let batpos;
let batImg;
let goalPos;
let path = [];
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

function getTileCenter(xj, yi){
  return createVector((xj+0.5)*blockSize, (yi+0.5)*blockSize);
}
function posToTileIdx(x, y){
  return {"x": floor(x/blockSize), "y": floor(y/blockSize)};
}
function sameLoc(locA, locB){
  return locA.x == locB.x && locA.y == locB.y;
}
function taxicabDist(locA, locB){
  return abs(locA.x - locB.x) + abs(locA.y - locB.y);
}

// NOTE: its currently crap 
// because IM not using a priority queue
// https://github.com/mourner/tinyqueue
// looks like a nice library to solve this issue (note: it allows you to define your own comparator function which is good)
// but lets fix correctness first... ;p
function dijkstra(){
  debug = [];
  let vtx_data = [];
  for(let i = 0; i < collision.length; i++){
    vtx_data.push([]);
    for(let j = 0; j < collision[i].length; j++){
      vtx_data[i].push({
        "dist": Infinity, 
        "visited": false, 
        "prev": {"x":-1, "y": -1},
        "queued": false
      });
    }
  }
  let Q = [];
  const startLoc = posToTileIdx(batpos.x-blockSize, batpos.y-blockSize);
  const goalLoc = posToTileIdx(goalPos.x, goalPos.y);
  vtx_data[startLoc.y][startLoc.x].dist = 0;
  Q.push(startLoc);

  while (Q.length > 0){
    Q.sort((vtxi, vtxj)=>vtx_data[vtxj.y][vtxj.x].dist-vtx_data[vtxi.y][vtxi.x].dist); // TODO: add distance as a heuristic
    let current = Q.pop();
    vtx_data[current.y][current.x].visited = true;
    if(vtx_data[goalLoc.y][goalLoc.x].visited == true)
      break;
    let offsets = [[1,0],[0,1],[-1,0],[0,-1]]; // these are [x,y] offsets
    for(let i = 0; i < offsets.length; i++){
      let neighbor = { "x": offsets[i][0] + current.x, "y": offsets[i][1] + current.y };
      // TODO: modify here so that it is a 2x2 block that we are collision checking against  
      if(neighbor.x >= 0 && neighbor.x < tiledims.x 
        && neighbor.y >= 0 && neighbor.y < tiledims.y 
        && !collision[neighbor.y][neighbor.x]){
        if(!vtx_data[neighbor.y][neighbor.x].visited){
          if(!vtx_data[neighbor.y][neighbor.x].queued){
            Q.push(neighbor)
            vtx_data[neighbor.y][neighbor.x].queued = true;
          }
          if(taxicabDist(current, neighbor) != 1){
            alert("AGGGGH"); // this test passes
          }
          let altDist = taxicabDist(current, neighbor) + vtx_data[current.y][current.x].dist;
          debug.push([neighbor, current]);
          if(altDist < vtx_data[neighbor.y][neighbor.x].dist){
            vtx_data[neighbor.y][neighbor.x].dist = altDist;
            // DUMB paranoia, doesnt even help, obviously
            vtx_data[neighbor.y][neighbor.x].prev.x = current.x;
            vtx_data[neighbor.y][neighbor.x].prev.y = current.y;
          }
        }
      }
    }
  }
  let out_path = [];
  let backwardsHead = goalLoc;
  while(!sameLoc(backwardsHead, startLoc)){
    out_path.push(backwardsHead);
    backwardsHead = vtx_data[backwardsHead.y][backwardsHead.x].prev;
  }
  console.log(vtx_data);
  return out_path.reverse();
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

  if(path.length > 0){
    fill(0,0,255);
    strokeWeight(10);
    let goalIdx = posToTileIdx(goalPos.x, goalPos.y);
    let goalLoc = getTileCenter(goalIdx.x, goalIdx.y);
    ellipse(goalLoc.x,goalLoc.y,25,25);
    let aaaa = posToTileIdx(batpos.x-blockSize, batpos.y-blockSize);
    let aaa = getTileCenter(aaaa.x, aaaa.y);
    let bbb = getTileCenter(path[0].x, path[0].y);
    line(aaa.x, aaa.y, bbb.x, bbb.y);
    for(let i = 0; i < path.length-1; i++){
      let aaa = getTileCenter(path[i].x, path[i].y);
      let bbb = getTileCenter(path[i+1].x, path[i+1].y);
      line(aaa.x, aaa.y, bbb.x, bbb.y);
    }
    strokeWeight(3);
    fill(255,0,0);
  }

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
        rect((x+0.5)*blockSize, (y+0.5)*blockSize, blockSize, blockSize);
      }
    }
  }

}

function mousePressed(){
  goalPos.x = mouseX; 
  goalPos.y = mouseY;
  path = dijkstra();
}


