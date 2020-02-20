
# enchantedForest

![Game Play Image](gameplayimg.png)

This game gets its _roots_ from ancient Norse Mythology. Maybe.

# Plot thoughts
what if npcs are the teleporters? [[ note: this would make the code easier... like if we had npc bob, then it would always teleport to a certain room etc... ]]

# Controls

## Movement
- A/LEFT, D/RIGHT, space
## moves
- c: coinshot
- x: fireball
- z: teleport (to be implemented)

# TODO

## BUGS
- if your screen is too small because e.g. you have dev console open, then the dialogue box gets pushed down...
- mobs dont die if they fall off screen
- lag??
-
- don't delete items on room change

## Both
- code cleanup [[e.g. increase encapsulation]]

## ALEK legit

- do AI stuff
  - flying swarm behavior
  - queen in the center, if queen struck down everything dies
  - bats!
- plot plot plot

## KEVIN legit
- SPRITE SHEEETS

- progress of ongoing quests (display details and requirements)
- items
  - should have info stuff appear in HUD about what the items do
  - should be able to use the items
- stats system 
    -   on levelup and stuff you can upgrade stats
    -   e.g. you can boost speed, strength, etc
- save progress
  - literally just JSON.stringify(player)
  - put it on local computer for now :(
  - load it up with a `$.getJSON`


## Alek

- mob types:
    - damage on impact
    - projectile mobs
    - boss mobs

- player has quest arrow
- cool names

- fix teleportation system (the teleport thing needs to say where is teleports you to...)


## Kevin
- clean up inventory system
- item usage e.g. onclick for potion -> mana
- concept art (sprite sheets 32x32 gimp)
- dialogue boxes (GUI) ADD NEXT CONVO MECHANISM
- add pictures to the HUD / just make it look nice
- attacks (complete weapon sytem)
  * fireballs explode upon impact
  * affecting enemies
- movement
  * teleportation

## Up for grabs MISC
- mobs walk on walls
- smiths / scrolls / other npcs  to update weapons 
- weapon and armor system
  -   update weapons.json
  -   hud stuff
- check for screen resize, then resize canvas
- movement
  * dashing
  * markers 
  * flight
  * coinshot flight
- support
  * shields
  * healing
  * upgrades
  * inventory system
      * talismans
      * money
  * objects
  * quests
  * minimap
- map design
- game plot 
- mysql data saving
- mobs dropping loot

# Done 

Feb 3
- fix collision detection:
  - for npcs (if you get kinda close it flashes)

1/27/2020
- basic dialogue box system
- Inventory system

1/25/2020
- mana regen
- clock
- removing irrelevant projectiles
- projectiles harm mobs
- added items that go into inventory

1/24/2020
- mana system
- rudimentary fireball tossing
- using external jsons for game data

1/23/2020
- collision detection (diagonal stuff broken)
- dying / respawn
- dialogue boxes / npcs
- world system (portals, doors)
- fast collision detection (its a freaking grid! collision detection can be supah fast, literally just check like the 6 squares that the player is touching and see if any of those have things that it's hitting in them)
- loading screen, trigger past it with a callback function
- mobs 

## Game documentation 

## imgs

All imgs are `pngs` 
Images must be named with the same name as the `type` of the `Entity` that they refer to, e.g. unicorn type's img is named `unicorn.png`
pictures are located in `data/section` where section is something like `weapon`, `mob`, or `item`
when adding a sprite, please add an entry to sprites.json

## tilemaps

### in order to add a new tile
- go into `data/maps/tileset.tsx` (its secretly an `xml`)
- add a tile, basically copy this:
```
 <tile id="8">
  <properties>
   <property name="name" value="teleporter"/>
  </properties>
  <image width="32" height="32" source="gimpTiles/teleporter.png"/>
 </tile>
```
- but replace the `path` and the `id` and the `source`
- (you can do this from the Tiled gui too, but its less fun)

## in order to write a map
- design the map in tiled
- save it
- export it as an image to tilemap.png in the appropriate room directory
- run `sh compileMaps.sh` from project root directory (this writes `map.json`)

### map design notes
- note that the player is 2 tiles high, so any "tunnel" in the tilemap needs to be 3 tiles high for the player to be able to go in it. The player can walk through a tunnel that is 2 high if it is flush with the ground (i.e. the player doens't need to jump to get into it)
- at least for now, the player can jump 3 tiles, that is, if it is on the ground and there is a stack of tiles 3 high, the player can jump onto the top of this

## json docs

#### sprites.json
Note: most of these arguments are optional. Kind of. Well there are defaults that might work....
```
{
  "unicorn": {
    "numframes": {"cols": 4, "rows": 2},
    "collision_offset": [0,0],
    "total_dims": [32,32],
    "collision_dims": [32,32],
    "pixel_dims": [64,64]
  }
}
```

#### quest.json
```
[
"gettingStarted": {
  "prereqs": [], // a list of quest ids (quest ids and quest names are the same)
  "rewards":{"xp": 10},
  "task": { // types of task: killing mobs, boss fights, collecting items, talking to npcs
    "type": "hunt", // hunt/boss/gather/talk
    "species": "ogre", // this depends on the thing 
    "quantity": 10 // this depends on the thing , note: quantity is "1" for binary things, e.g. "talk to bob" YES ALL QUESTS MUST HAVE A quantity associated with them
  },
  "followups": ["quest2"]
}
]
```

#### npcs.json
```
{
"startRoom": [
  {
    "name": "dawg",
    "proposeQuest": "gettingStarted",
    "dialogue": "heyo, im an npc"
  }
]
}
```

## General advice: have exactly 1 name for everything
The names in things like npcs.json instruct the program where to look for imgs. For example, if an image is named "dawg" in `npc.json` then it's image is at `data/avatars/dawg.png` or something

## Interface schema
Dialogue box has all the details, descriptions, etc (arrow keys to go through)
  -options to set quick access
Quick access displays clickable 10 items

## Namey things & Plot
  | Game           |                |
  | Money          | Coppola        |
  | Dead companion | Bucky/Buchanan |
  | Protagonist    | Bob            |
  | World          | Llama Land    |
  | Dragon         | Malimost       |
  | Magic source   | The Levant     |
  | Magic system   | Levancy        |
  | Magic users    | Levanters      |

  Overall plot: 

  Bob, the weary traveller, discovers his magic capabilities for the first time. 
  Kelsier mentors him on learning his abilities. 
  A dragon, Malimost burns down Bob's village. 
  Buchanan "dies". jumpydude comes in as replacement companion. 
  Bob ventures into the dragon's homeland and seeks revenge. 

  Sketchy npc makes you massacre an entire village 
  Murders Malimost, becomes the dragon, every hates you, wanders the world alone PLOT TWIST EVERYBODY
  Dragon armor, multiple npcs challenges them
  Confronted by a key npc (Buchanan) that notifies the player that they are the villain
  flashback: jumpydude tried to murder buchanan but failed
  "I did this for you!!!"
  Upon realizing they are the villain, the player sacrifices themselves as the redemption arc
  final boss: jumpydude (basically palpatine version 6.2)

  Npc names
  - Alice
  - Eve
  - Azriel
  - Nova
  - Serena
  - jumpydude (guy that leads you to do the sketchy stuff)
  - Cassandra (reoccuring oracle that gives info)
  - Call of the Blessed (cult you encounter along the way)
  - (reoccuring merchant)
  - npc that consistently calls protagonist noobie

  Enemies: 
  - dragons
  - bats
  - skeletons
  - Leviathan

  Items: 
  - Urim & Thummim
  - Blade of smoke

  geographically-based (eg. fire levant, wind levant)
  Abilities: 
  - Melee (swords)

  - teleportation
  - flight

  - undead minions (necromancy)
  - npcs helping you in a fight (eg. buchanan)

  Areas: 
  - llama land (melee + spitting on enemies + summon llama-unicorn)
  - storm (lightning + wind/tornado + rain)
  - plant control (vine whip, earthquakes)

  introduce shadow area upon buchanan's death
  - shadow (induces insanity/unfurling shadows-based attacks + necromancy)
  - outer space (gravity/telekinesis -based abilities)
  - dragonfire (flames)
  - jumpydude fortress (iron walls, shoot spikes)

## Semi-detailed plot outline
  - llama land 
    - give background
    - tutorial
    - introduce buchanan
    - establish Malimost as the villain (murders an entire village of dogs)
    - too weak to kill Malimost
  - storm
    - Leviathan (skull makes you fireproof, able to enter fire area after this)
    - get key
  - plants
    - get key
    - Buchanan dies
  - shadow
    - meet jumpydude
    - gain first minion through necromancy
    - get key
    - allowed to murder npcs
    - steals potion from a sick/dying npc
  - outer space
    - murders an entire village
    - teleport to dragon fire using all the keys
  - dragon fire
    - kills malamir
    - bucky comes back
    - realizes they've been playing as the villain the entire game  
  - jumpydude fortress
    - sacrifice
    - kills jumpydude
    - the end


## dark vs light Levancy
dark levancy is just a tinted version of light levancy
it is more powerful, but it comes at a cost, namely it makes you evil (greedy, powerhungy etc)

dark levancy: you can steal the powers of others
light levancy: they can only be freely given

## characters

Malimost:
  Family slaughtered as a youth, driven on a quest to control who has access to the Levant
  He only really allows people to possess it if they swear a magically binding oath (he has an item, the bondstone that enables this, people will burn up if they break the vow) to obey him.
  He seeks out any "rogue" Levanters and forces them to either bond to him or die.
  he is very paranoid
  people have legends about the Levant being used for great things => unhappy
  some communities of rogue levanters exists and resist

Bob:
  "rogue" Levanter, doesnt really know about his powers
  Home destroyed by malimost's minions because they offended them somehow, maybe rebelled
  wants revenge (initially) 
  after learning more about the Levant (and his turning point) he actually wants to bring back free use of the Levant for the good of people




