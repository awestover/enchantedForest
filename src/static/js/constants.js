let player;
const blockSize = 32;
const gravity = 0.2;
const friction = 0.06;
const moveAccel = 0.3;
const jumpImpulse = 7;
const collisionTollerence = 0.0001;
const levelupReqXP = [
  100, 1000, 2000, 4000,4010,4020,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100,
  4030,4040,4050,4060,4070,4080,4090,4100
];

let loaded_user_data = {};
let first_load = true;

let tutorial_damage_disabled = false;

const KEY_CODE_TABLE = {
  "up": 38, 
  "left": 37, 
  "right": 39, 
  "space": 32,
  "shift": 16, 
  "enter": 13, 
  "escape": 27,
  "0": 48, 
  "a": 65, 
  "d": 68, 
  "c": 67, 
  "q": 81, 
  "w": 87, 
  "x": 88,
  "u": 85, 
  "e": 69
}

let smoothedFrameRateEstimate = 60;
let frameRateSmootherLambda = 0.01;

let roomImage;
// let currentRoom = "levantersKeep";
let currentRoom = "bobsTown_tutorial";
let data;
let roomTraits = {};
let cameraSeeking = false, lost = false;
const TILE_TYPES = ["mob", "npc", "item"];
const DYNAMIC_TILE_TYPES = ["mob", "item"];
let TILE_NAMES_TO_IDS = {}; // {"black": "2", "collision": "1", ...}
let TILE_IDS_TO_NAMES = {}; // {"2": "black", "1": "collision", ...}
let TILE_TYPE_TO_NAMES = {}; // {"item": ["item:gem", "item:potion", ...],...}
let mapTileDims = new p5.Vector(32,32); // really read this in from a file
let cameraPos = new p5.Vector(0,0);
let itemManager = new ItemManager();
let questSystem = new QuestSystem();
let display = new HUD();
let dialogue = new Dialogue();
let mobs = [], items = [];
let stats = {
  "weapons": {},
  "items": {},
  "mobs": {}
}
let quest_data = {};
let npc_data = {};
let sprite_data = {};
let teleporter_data = {};
let ct = 0;
let manaRegenFrames = 20;

// teleporterA in roomX is linked with teleporterA in roomY where teleporterA says in data/teleporter.json that it links to roomY
const TELEPORTER_NAMES = ["teleporterA", "teleporterB", "teleporterC", "teleporterD", "teleporterE"];

// inserting dijkstras
let goalPos;
let path = [];
let batpos;
let batImg;
let pathProgressCt = 30;
let pathProgressCap = 30;
let batHeading = new p5.Vector(0,0);

let inventoryList = [];

let lastDialogueBoxToShow = null;
const npcCollisionTolerence = 1.5;

// this makes sure that we load the "asset" jsons before trying to load the world 
let init_toload = ["sprites", "quests", "npcs", "teleporters", "loaded_user_data"];
let triggered_initial_room_load = false;
let loadingRoom = true;
let quickAccessItems = [];

let bgColor = "#ffffff";

// weather
let bolts = [];
let fallingParticles = [];
let windCt = 0; // cool thought: maybe if this wind is strong enough it should affect the player as well....
function windAtTime(){
  let xSpeed = 3*(Math.pow(sin(windCt), 70)*Math.sign(Math.sin(windCt)));
  return createVector(xSpeed, abs(xSpeed)*0.1);
}

String.prototype.chopPrefix = function(prefix){
  return this.substr(this.indexOf(prefix)+prefix.length);
}

function removeElts(arr, elt){
  for(let i = arr.length-1; i >= 0; i--){
    if(arr[i] === elt){
      arr.splice(i, 1);
    }
  }
}

