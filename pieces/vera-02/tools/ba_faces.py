"""vera-01 face-streak review: crops every visible head (meta.heads from sb_shots.js) from two still sets, BEFORE | AFTER.
usage: python tools/ba_faces.py <before dir> <after dir> <out.png>"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
PIECE = Path(__file__).resolve().parents[1]
bdir, adir, out = map(Path, sys.argv[1:4])
meta = json.loads((PIECE / 'engine' / 'stills' / 'sb_meta.json').read_text(encoding='utf-8'))
F = ImageFont.truetype(str(PIECE / 'engine' / 'fonts' / 'PixelifySans.ttf'), 24); Fs = ImageFont.truetype(str(PIECE / 'engine' / 'fonts' / 'PixelifySans.ttf'), 20)
cells = []
for i, m in enumerate(meta):
    f = f'f_{(i * 3 + 1) * 30:04d}.png'
    for (x, y, r, vis) in sorted(m.get('heads', []), key=lambda h: -h[2]):
        if not vis or not (0 < x < 1080 and 0 < y < 1920) or r < 30: continue
        h = max(90, int(r * 1.25)); box = (x - h, y - h, x + h, y + h)
        cells.append((m['id'], *(Image.open(d / f).convert('RGB').crop(box).resize((300, 300), Image.NEAREST) for d in (bdir, adir))))
cols, cw, ch = 4, 620, 340; rows = (len(cells) + cols - 1) // cols
o = Image.new('RGB', (cols * cw + 20, 110 + rows * ch), (16, 16, 20)); d = ImageDraw.Draw(o)
d.text((20, 16), 'vera-01 face streaks  -  BEFORE (left) | AFTER (right), every visible head in every shot', font=F, fill=(240, 240, 240))
d.text((20, 54), 'Cause: the PS1 vertex snap (270x480 grid) cracked the head mesh at its T-junctions; the dark hair back faces showed through as dashed lines. Fix: no vertex snap on the characters (set keeps it).', font=Fs, fill=(190, 190, 200))
for k, (sid, a, b) in enumerate(cells):
    x, y = 20 + (k % cols) * cw, 110 + (k // cols) * ch
    d.text((x, y), f'#{sid}', font=F, fill=(255, 220, 120)); o.paste(a, (x, y + 30)); o.paste(b, (x + 305, y + 30))
o.save(out); print(out, o.size, len(cells), 'heads')
