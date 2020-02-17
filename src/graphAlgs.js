function posToTileIdx(x, y){
  return {
    "x": Math.round(x / blockSize + mapTileDims.x/2),
    "y": Math.round(y / blockSize + mapTileDims.y/2)
  }
}
function sameLoc(locA, locB){
  return locA.x == locB.x && locA.y == locB.y;
}
function taxicabDist(locA, locB){
  return abs(locA.x - locB.x) + abs(locA.y - locB.y);
}

function dijkstra(collision, startLoc, goalLoc){
  if(startLoc.x >= collision[0].length || startLoc.x < 0
   || goalLoc.x >= collision[0].length || goalLoc.x < 0
   || startLoc.y >= collision.length || startLoc.y < 0
   || goalLoc.y >= collision.length || goalLoc.y < 0){
    console.log("BROKEN DIJKSTRAS");
    return [];
  }

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
  let Q = new TinyQueue([], function(a, b){
    let heuristicDiff = taxicabDist(a, startLoc)+taxicabDist(a,goalLoc) - (taxicabDist(b, startLoc)+taxicabDist(b, goalLoc));
    let sofarDiff = vtx_data[a.y][a.x].dist-vtx_data[b.y][b.x].dist;
    return heuristicDiff + sofarDiff;
  });

  vtx_data[startLoc.y][startLoc.x].dist = 0;
  Q.push(startLoc);

  while (Q.length > 0){
    let current = Q.pop();
    vtx_data[current.y][current.x].visited = true;
    if(vtx_data[goalLoc.y][goalLoc.x].visited == true)
      break;
    let offsets = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]; // these are [x,y] offsets
    for(let i = 0; i < offsets.length; i++){
      let neighbor = { "x": offsets[i][0] + current.x, "y": offsets[i][1] + current.y };
      // TODO: modify here so that it is a 2x2 block that we are collision checking against  
      if(neighbor.x >= 0 && neighbor.x < mapTileDims.x 
        && neighbor.y >= 0 && neighbor.y < mapTileDims.y 
        && collision[neighbor.y][neighbor.x]!="1"){
        if(!vtx_data[neighbor.y][neighbor.x].visited){
          if(!vtx_data[neighbor.y][neighbor.x].queued){
            Q.push(neighbor)
            vtx_data[neighbor.y][neighbor.x].queued = true;
          }
          let altDist = taxicabDist(current, neighbor) + vtx_data[current.y][current.x].dist;
          debug.push([neighbor, current]);
          if(altDist < vtx_data[neighbor.y][neighbor.x].dist){
            vtx_data[neighbor.y][neighbor.x].dist = altDist;
            vtx_data[neighbor.y][neighbor.x].prev = current;
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
  // console.log(vtx_data);
  return out_path.reverse();
}

