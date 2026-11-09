# .venv/bin/python board_sheet.py -> board/board_1.jpg.. (30 panels each, 10x3) with number, time and line
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'board')
shots = json.load(open(os.path.join(D, 'shots.json')))
PW, PH, CAP, COLS, PER = 270, 480, 92, 10, 30
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 17); small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 15)
except Exception: font = small = ImageFont.load_default()
def wrap(t, n=30):
    out, line = [], ''
    for w in t.split():
        if len(line) + len(w) + 1 > n: out.append(line); line = w
        else: line = (line + ' ' + w).strip()
    out.append(line); return out[:3]
for b in range(0, len(shots), PER):
    part = shots[b:b + PER]; rows = (len(part) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * PW, rows * (PH + CAP)), (18, 18, 22)); d = ImageDraw.Draw(sheet)
    for k, s in enumerate(part):
        n = s['i'] + 1; x, y = (k % COLS) * PW, (k // COLS) * (PH + CAP); f = os.path.join(D, f'p{n:02d}.jpg')
        if os.path.exists(f): sheet.paste(Image.open(f).resize((PW - 4, PH - 4)), (x + 2, y + 2))
        d.rectangle([x + 2, y + 2, x + 62, y + 26], fill=(0, 0, 0)); d.text((x + 6, y + 5), f'{n}', font=font, fill=(255, 200, 80))
        d.text((x + 6, y + PH + 2), f"{s['t0']:.1f}-{s['t1']:.1f}s  {s['set']}", font=small, fill=(150, 150, 160))
        for j, l in enumerate(wrap(s['line'])): d.text((x + 6, y + PH + 22 + j * 22), l, font=font, fill=(240, 240, 240))
    out = os.path.join(D, f'board_{b // PER + 1}.jpg'); sheet.save(out, quality=88); print(out)
