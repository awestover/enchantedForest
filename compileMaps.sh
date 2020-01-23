cd data/maps
pwd
FILES=rooms/*/
for room in $FILES
do 
  echo "Processing $room"
  echo "python3 scrapmap.py $room"
  python3 scrapmap.py "$room"
done
cd ../..
