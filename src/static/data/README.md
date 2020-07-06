## Game documentation  
_This is a good spot to put anything that is kind of confusing or just good to know. Standards, conventions lots of good stuff._

## imgs

`convert` is cool
`convert a.png b.png c.png -append blah.png` (vertical concat)
`convert a.png b.png c.png +append blah.png` (horizontal concat)

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
    "type": "questDealer" / "merchant" / "talker"
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

## Interface design

popup
	-inventory list
		-item description card
	armor list
		-armor description card
	charm list
		-charm description card
	weapons list
		-weapon description card
	magic list
		-magic description card

	quest list
		-quest description card
	shop list
		-item description card
	stats list (upgrade interface; points granted upon level up)

dialogue box
quick access
	-9 shortcut items


