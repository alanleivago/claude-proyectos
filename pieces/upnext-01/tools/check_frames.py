"""contact sheet of a render: one frame mid-shot + one at each subtitle's full-typed moment -> work/check_<name>.png"""
import json, subprocess, sys, os
from pathlib import Path
from PIL import Image, ImageDraw
PIECE = Path(__file__).resolve().parents[1]; TL = json.loads((PIECE / 'engine' / 'film_timeline.json').read_text(encoding='utf-8'))
vid = sys.argv[1]; name = Path(vid).stem; tmp = PIECE / 'work' / f'chk_{name}'; tmp.mkdir(parents=True, exist_ok=True)
ts = sorted(set([round((s['t0'] + s['t1']) / 2, 2) for s in TL['shots']] + [round(min(c['typed'] + 0.1, c['end'] - 0.05), 2) for c in TL['cards']]))
tiles = []
for t in ts:
    f = tmp / f'{t:06.2f}.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', vid, '-frames:v', '1', '-vf', 'scale=216:384', str(f)], check=True, timeout=60, env={**os.environ})
    im = Image.open(f).convert('RGB'); ImageDraw.Draw(im).text((4, 4), f'{t:.2f}', fill=(255, 255, 0)); tiles.append(im)
cols = 12; rows = (len(tiles) + cols - 1) // cols; sheet = Image.new('RGB', (216 * cols, 384 * rows))
for i, im in enumerate(tiles): sheet.paste(im, ((i % cols) * 216, (i // cols) * 384))
out = PIECE / 'work' / f'check_{name}.png'; sheet.save(out); print(out, len(tiles))
