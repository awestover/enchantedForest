
# enchantedForest

![Game Play Image](gameplayimg.png)

This game gets its _roots_ (ahhhhhahaha) from anchient Norse Mythology.

# TODO

## Alek
- loading screen, trigger past it with a callback function
- mobs AI

## Kevin
- concept art (sprite sheets)
- dialogue boxes (GUI)
- attacks
  * coinshot
  * fireballs
- movement
  * teleportation

## Up for grabs
- attack
  * mana
- movement
  * dashing
  * markers 
  * flight
  * coinshot flight
- support
  * shields
  * healing
- game interface
   * dialogue boxes
   * inventory system
      * talismans
      * money
   * objects
   * level-up system
   * quests
   * minimap
- map design
- plot
- mysql data saving

# Done 
1/23/2020 Alek
- collision detection (diagonal stuff broken)
- dying / respawn
- dialogue boxes / npcs
- world system (portals, doors)
- fast collision detection (its a freaking grid! collision detection can be supah fast, literally just check like the 6 squares that the player is touching and see if any of those have things that it's hitting in them)

## Game documentation 

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

