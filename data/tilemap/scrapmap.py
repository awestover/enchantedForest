from bs4 import BeautifulSoup
import json

with open("tilemap.tmx", "r") as f:
    data = BeautifulSoup(f, "xml")
    for layer in data.findAll("layer"): 
        if layer.attrs["name"] == "platforms": 
            data = layer.data.text.strip()+","


with open("tilemap.json", "w") as f:
    tilemap = [x.strip()[:-1].split(",") for x in data.split('\n')]
    json.dump(tilemap, f)

