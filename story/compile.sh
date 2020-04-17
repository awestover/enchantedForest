cat story*.md > full_story.md
pandoc --css style.css -o full_story.epub metadata.txt full_story.md
