# storyboard contact sheets per chapter: each panel frame with its id, start time (mm:ss) and the narration it carries
# usage (from pieces/zelda-oot): ../../.venv/bin/python tools/sheets.py board/full board/times.json
import json, sys, textwrap, re
from PIL import Image, ImageDraw, ImageFont
d, tj = sys.argv[1], sys.argv[2]
shots = json.load(open(tj)); V = json.load(open('voice.json'))
head = open('src/head.html').read()
cards = {m[0]: m[1] for m in re.findall(r"\['(p\d+)', [^\n]*?, '([^']+)'\],\n", head)}
F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 17); FB = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 20)
mmss = lambda t: f'{int(t // 60)}:{int(t % 60):02d}'
chapters, cur = [], None
for s in shots:
    if s['id'] in cards or cur is None: cur = [cards.get(s['id'], '0 · COLD OPEN'), []]; chapters.append(cur)
    cur[1].append(s)
TW, TH, COLS = 576, 324, 3
for ci, (name, ss) in enumerate(chapters):
    rows = (len(ss) + COLS - 1) // COLS; CH = TH + 120
    sheet = Image.new('RGB', (COLS * TW + (COLS + 1) * 16, 70 + rows * (CH + 16)), (36, 26, 16)); dr = ImageDraw.Draw(sheet)
    dr.text((16, 20), name, font=FB, fill=(240, 222, 190))
    for k, s in enumerate(ss):
        x, y = 16 + (k % COLS) * (TW + 16), 70 + (k // COLS) * (CH + 16)
        sheet.paste(Image.open(f"{d}/p{shots.index(s) + 1:02d}.jpg").resize((TW, TH)), (x, y))
        txt = ' '.join(l['text'] for l in V['lines'] if s['t0'] - 0.3 <= l['t0'] < s['t1'] - 0.3)
        dr.text((x, y + TH + 6), f"{s['id']}  {mmss(s['t0'])}–{mmss(s['t1'])}", font=FB, fill=(233, 181, 74))
        for j, ln in enumerate(textwrap.wrap(txt, 66)[:4]): dr.text((x, y + TH + 32 + j * 21), ln + (' …' if j == 3 else ''), font=F, fill=(240, 228, 200))
    sheet.save(f'{d}/sheet_{ci:02d}.jpg', quality=85); print(f'{d}/sheet_{ci:02d}.jpg', name, len(ss))
