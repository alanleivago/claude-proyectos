# Coordinate grid over a keyed character PNG, to read joints and cut polygons off it.  usage: python tools/grid.py in.png out.png
import sys
from PIL import Image, ImageDraw
im = Image.open(sys.argv[1]).convert('RGBA'); W, H = im.size
bg = Image.new('RGBA', (W, H), (60, 60, 60, 255)); bg.alpha_composite(im); d = ImageDraw.Draw(bg)
for x in range(0, W, 50): d.line([(x, 0), (x, H)], fill=(255, 255, 0, 200) if x % 100 == 0 else (0, 255, 255, 120))
for y in range(0, H, 50): d.line([(0, y), (W, y)], fill=(255, 255, 0, 200) if y % 100 == 0 else (0, 255, 255, 120))
for x in range(0, W, 100):
    for y in range(0, H, 100): d.text((x + 2, y + 2), f"{x},{y}", fill=(255, 255, 255, 255))
bg.convert('RGB').save(sys.argv[2])
