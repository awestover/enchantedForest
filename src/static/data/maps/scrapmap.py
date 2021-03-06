from bs4 import BeautifulSoup
import json
import os
import sys

try:
    room = sys.argv[1]
except:
    print("ERROR, please provide room as argv")
    sys.exit()

# INPUT: 
# a tileset.tsx (composed of images that are layed down to make the map)
# a tilemap.tmx (the actual tilemap)
# note: in reality these are both just glorified xmls, with tileset.tsx basically just containing basic info about each tile (e.g. tile id, image path), and with tilemap.tmx containing basically a 2D array for each layer of whcih tiles have been placed down
# OUTPUT: a single json file containing a nicer representation of the map
# more specifically, the json will look like this:
#  {
#      "tilecount": x,
#      "tiles": {
#          "1(id)": {
#              "tilename": "blah",
#              "imgpath": "blah.png"
#          },
#          etc
#      },
#      "layers": {
#          "platforms(layername)": [[0,0,0,...], ...],
#          etc
#      }
#  }

output = {
    "tilecount": 0,
    "tiles": { # note, tiles are 1 indexed!!
        "0": {
            "tilename": "empty",
            "imgpath": ""
        }
    },
    "layers":{
    }
}

with open("tileset.tsx", "r") as f:
    data = BeautifulSoup(f, "xml")
    output["tilecount"] = data.find("tileset").get("tilecount")
    for tile in data.find_all("tile"):
        tileId = str(int(tile.get("id")) + 1)
        output["tiles"][tileId] = {
            "tilename": tileId, 
            "imgpath": tile.find("image").get("source")
        }
        for tileproperty in tile.find_all("property"):
            if tileproperty.get("name") == "name":
                output["tiles"][tileId]["tilename"] = tileproperty.get("value")

with open(os.path.join(room, "tilemap.tmx"), "r") as f:
    data = BeautifulSoup(f, "xml")
    for layer in data.findAll("layer"): 
        mapdata = layer.data.text.strip()+","
        tilemap = [x.strip()[:-1].split(",") for x in mapdata.split('\n')]
        output["layers"][layer.attrs["name"]] = tilemap

with open(os.path.join(room, "map.json"), "w") as f:
    json.dump(output, f)

with open("../teleporters.json", "r") as f:
    teleporter_data = json.load(f)
real_room_name = os.path.split(os.path.split(room)[0])[1]

roomstuff = output["layers"]["roomstuff"]
for i in range(len(roomstuff)):
    for j in range(len(roomstuff[i])):
        tile_name = output["tiles"][roomstuff[i][j]]["tilename"]
        if "teleporter" in tile_name:
            teleporter_data[real_room_name][tile_name]["location_of_this_teleporter"] = {"x": j, "y": i}

with open("../teleporters.json", "w") as f:
    json.dump(teleporter_data, f, indent=4)

