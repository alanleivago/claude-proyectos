# .venv/bin/python peek.py 3,7,9-12 out.jpg -> labelled contact sheet of board panels (7 per row)
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'board'); shots = json.load(open(os.path.join(D, 'shots.json')))
ids = []
for p in sys.argv[1].split(','):
    a, _, b = p.partition('-'); ids += list(range(int(a), int(b or a) + 1))
PW, PH, C = 270, 480, 7; font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
rows = (len(ids) + C - 1) // C; im = Image.new('RGB', (C * PW, rows * PH), (0, 0, 0)); d = ImageDraw.Draw(im)
for k, n in enumerate(ids):
    x, y = (k % C) * PW, (k // C) * PH; f = os.path.join(D, f'p{n:02d}.jpg')
    if os.path.exists(f): im.paste(Image.open(f).resize((PW, PH)), (x, y))
    d.rectangle([x, y, x + PW, y + 24], fill=(0, 0, 0)); d.text((x + 4, y + 3), f"{n} {shots[n-1]['line'][:28]}", font=font, fill=(255, 210, 90))
im.save(sys.argv[2], quality=85); print(sys.argv[2])
