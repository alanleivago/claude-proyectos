"""Contact sheet per scene: key frame per beat + id, timecode, mode and the lettered text.
  .venv/bin/python pieces/gta6-story/tools/sheets.py  -> review/board_s<N>.jpg
"""
import json, os, textwrap
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
beats = json.load(open(os.path.join(D, 'review/script.json')))
F = os.path.expanduser('~/Library/Fonts/Bangers-Regular.ttf')
fT, fB = ImageFont.truetype(F, 30), ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 17)
NAMES = ['Opening', 'The cell', 'Panel credits', 'Release', 'The debt', 'The job', 'It goes wrong', 'Cal finds out', 'Only way out', 'Close']
tc = lambda s: '%d:%04.1f' % (s // 60, s % 60)
TW, TH, COLS, TXT = 640, 360, 3, 150
for s in range(10):
    bs = [b for b in beats if b['scene'] == s]
    rows = (len(bs) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * (TW + 16) + 16, 70 + rows * (TH + TXT + 16)), (24, 16, 30))
    d = ImageDraw.Draw(sheet)
    d.text((16, 14), f'{s}. {NAMES[s].upper()}   {tc(bs[0]["t0"])} - {tc(bs[-1]["t0"] + bs[-1]["dur"])}   ONLY WAY OUT - storyboard', font=ImageFont.truetype(F, 40), fill=(255, 225, 77))
    for i, b in enumerate(bs):
        x, y = 16 + (i % COLS) * (TW + 16), 70 + (i // COLS) * (TH + TXT + 16)
        sheet.paste(Image.open(os.path.join(D, 'review/keys', b['id'] + '.jpg')).resize((TW, TH)), (x, y))
        d.rectangle([x, y + TH, x + TW, y + TH + TXT], fill=(244, 238, 228))
        d.text((x + 8, y + TH + 4), f'{b["id"]}  {tc(b["t0"])}-{tc(b["t0"] + b["dur"])}  ({b["dur"]:.1f}s)  {b["mode"]}', font=fT, fill=(18, 10, 18))
        ty = y + TH + 40
        for it in b['items']:
            tag = {'caption': 'CAP', 'sfx': 'SFX'}.get(it['kind'], f'{it.get("who", "").upper()}/{it.get("type", "")}')
            for j, ln in enumerate(textwrap.wrap(f'{tag}: {it["text"]}', 70)[:2]):
                if ty < y + TH + TXT - 18: d.text((x + 8, ty), ln, font=fB, fill=(40, 20, 50)); ty += 20
    sheet.save(os.path.join(D, f'review/board_s{s}.jpg'), quality=85)
print('sheets done')
