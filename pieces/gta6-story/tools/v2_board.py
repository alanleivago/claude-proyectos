"""v2 board sheets: one keyframe per shot (review/v2_keys/<id>.jpg, text included) + shot info from shotlist_v2.md.
  python v2_board.py 0 1   -> review/v2_board_s0.jpg, review/v2_board_s1.jpg"""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); F = os.path.join(D, 'fonts')
rows = {}
for l in open(os.path.join(D, 'shotlist_v2.md'), encoding='utf-8'):
    m = re.match(r'\| (S\d-\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|', l)
    if m: rows[m.group(1)] = [c.strip() for c in m.groups()]
hd = ImageFont.truetype(os.path.join(F, 'BarlowCondensed-ExtraBold.ttf'), 34)
h2 = ImageFont.truetype(os.path.join(F, 'BarlowCondensed-ExtraBold.ttf'), 26)
tx = ImageFont.truetype(os.path.join(F, 'Outfit-SemiBold.ttf'), 17)
title = {'0': '0. OPENING', '1': '1. THE CELL'}
def wrap(d, s, w):
    out, cur = [], ''
    for word in s.split():
        t = (cur + ' ' + word).strip()
        if d.textlength(t, font=tx) > w and cur: out.append(cur); cur = word
        else: cur = t
    return out + ([cur] if cur else [])
for sc in sys.argv[1:]:
    ids = sorted([k for k in rows if k.startswith(f'S{sc}-') and os.path.exists(os.path.join(D, 'review/v2_keys', k + '.jpg'))], key=lambda k: int(k.split('-')[1]))
    cols, tw = 3, 620; th = tw * 9 // 16; ch = th + 150; Wd = 24 + cols * (tw + 16); rws = (len(ids) + cols - 1) // cols
    im = Image.new('RGB', (Wd, 90 + rws * (ch + 16)), (18, 10, 24)); d = ImageDraw.Draw(im)
    tot = sum(float(rows[k][2]) for k in ids)
    d.text((24, 26), f'ONLY WAY OUT v2  ·  {title.get(sc, sc)}  ·  {len(ids)} shots, {tot:.1f} s  ·  key frame per shot (text as on screen)', font=hd, fill=(255, 225, 77))
    for i, k in enumerate(ids):
        x, y = 24 + (i % cols) * (tw + 16), 90 + (i // cols) * (ch + 16)
        im.paste(Image.open(os.path.join(D, 'review/v2_keys', k + '.jpg')).resize((tw, th), Image.LANCZOS), (x, y))
        r = rows[k]; d.rectangle([x, y + th, x + tw, y + ch], fill=(244, 238, 228))
        d.text((x + 10, y + th + 6), f'{k}  ·  {r[2]} s  ·  beat {r[1]}  ·  {r[4].split(" ")[0]}', font=h2, fill=(20, 8, 24))
        lines = wrap(d, r[3], tw - 20)[:2] + wrap(d, r[5], tw - 20)[:3]
        for j, l in enumerate(lines): d.text((x + 10, y + th + 42 + j * 21), l, font=tx, fill=(50, 30, 60))
    im.save(os.path.join(D, f'review/v2_board_s{sc}.jpg'), quality=88); print('wrote', f'review/v2_board_s{sc}.jpg', im.size)
