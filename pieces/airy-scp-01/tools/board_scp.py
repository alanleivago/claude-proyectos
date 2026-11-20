"""airy-scp-01 storyboard: caption every raw still (pink = Airy, yellow = guard, Montserrat Black, thick black outline,
centred at 62 % height) and build the contact sheet with shot / est. time / line. Times estimated at the passthesalt pace
(3.6 words/s + 0.15 s gap; silent beats 1.0 s and 2.0 s) until the real voices exist."""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
P = Path(__file__).resolve().parents[1]; SB = P / 'storyboard'
FONT = str(Path.home() / 'Library/Fonts/Montserrat-Black.ttf')
COL = {'AIRY': (255, 182, 214), 'GUARD': (255, 222, 74)}
meta = json.loads((SB / 'sb_meta.json').read_text())
raws = sorted((SB / 'raw').glob('f_*.png'))
FONT = str(Path.home() / 'Library/Fonts/BarlowCondensed-ExtraBold.ttf')   # v2: condensed bold like the ref, ONE line per card
FS, CAPY = 68, 0.64
def chunks(text, W=1080, f=None):
    """passthesalt cards: one line each (<= 86 % width), split at punctuation first, then by width."""
    f = f or ImageFont.truetype(FONT, FS); d = ImageDraw.Draw(Image.new('RGB', (8, 8)))
    parts = [x.strip() for x in re.split(r'(?<=[.,?!])\s+', text) if x.strip()]; out = []
    for pt in parts:
        cur = ''
        for w in pt.split():
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=f) > W * 0.86 and cur: out.append(cur); cur = w
            else: cur = t
        out.append(cur)
    m = []   # merge tiny neighbours ("Fine." + next) when they still fit on one line
    for c in out:
        if m and len(m[-1].split()) + len(c.split()) <= 5 and d.textlength(m[-1] + ' ' + c, font=f) <= W * 0.86 and len(c.split()) <= 2: m[-1] += ' ' + c
        else: m.append(c)
    return m
def cap(img, text, col, heads=()):
    W, H = img.size; f = ImageFont.truetype(FONT, FS); d = ImageDraw.Draw(img); ln = chunks(text, W, f)[0]
    tw = d.textlength(ln, font=f); x = (W - tw) / 2; y = int(H * CAPY) - FS // 2
    d.text((x, y), ln, font=f, fill=col, stroke_width=6, stroke_fill=(0, 0, 0))
    for hx, hy, hr, vis in heads:   # face check: the head circle (mouth..crown) must not touch the caption box
        if vis and abs(hx - W / 2) < tw / 2 + hr and y - 10 < hy + hr * 0.9 and hy - hr < y + FS + 10: return 'FACE'
    return ''
t = 0.0; rows = []
for m, r in zip(meta, raws):
    words = len(re.findall(r"[A-Za-z0-9']+", m.get('line', '')))
    dur = 1.0 if m['id'] == '23' else 2.0 if m['id'] == '32' else max(0.9, words / 3.6) + 0.15
    img = Image.open(r).convert('RGB')
    if m.get('line') and m['id'] != '23':
        bad = cap(img, m['line'], COL.get(m['who'], (255, 255, 255)), m.get('heads', ()))
        if bad: print('CAPTION OVER FACE', m['id'])
        m['cards'] = chunks(m['line'])
    img.save(SB / f"shot_{m['id']}.png"); rows.append((m, t, dur, img)); t += dur
print(f'estimated duration {t:.1f} s, {len(rows)} shots')
cw, ch = 216, 384; cols = 6; n = len(rows); R = (n + cols - 1) // cols; txt = 120
sheet = Image.new('RGB', (cols * cw, R * (ch + txt)), (18, 18, 20)); d = ImageDraw.Draw(sheet); fs = ImageFont.truetype(FONT, 15); fb = ImageFont.truetype(FONT, 20)
for i, (m, t0, dur, img) in enumerate(rows):
    x, y = (i % cols) * cw, (i // cols) * (ch + txt); sheet.paste(img.resize((cw, ch)), (x, y))
    d.text((x + 6, y + ch + 4), f"{m['id']}  {t0:4.1f}s  {m['lens']}mm", font=fb, fill=(255, 255, 255))
    line = f"{m['who']}: {m['line']}" if m.get('line') else '(silence)'; note = m.get('note', '')
    words, cur, out = (line + '  // ' + note).split(), '', []
    for w in words:
        tt = (cur + ' ' + w).strip()
        if d.textlength(tt, font=fs) > cw - 10 and cur: out.append(cur); cur = w
        else: cur = tt
    out.append(cur)
    for k, ln in enumerate(out[:5]): d.text((x + 6, y + ch + 30 + k * 17), ln, font=fs, fill=COL.get(m['who'], (190, 190, 190)) if k < 2 else (150, 150, 150))
sheet.save(SB / 'board.png'); print('->', SB / 'board.png')
